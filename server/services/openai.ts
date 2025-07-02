import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

interface TaxContext {
  jurisdiction: 'us' | 'in';
  currency: 'usd' | 'inr';
  userMessage: string;
  conversationHistory: Array<{role: 'user' | 'assistant', content: string}>;
}

interface AIResponse {
  content: string;
  thinkingMode: string;
  categories: string[];
  actionItems: string[];
  keyInsights: string[];
  nextQuestions: string[];
}

export class TaxThinkingService {
  private getSystemPrompt(jurisdiction: 'us' | 'in', currency: 'usd' | 'inr'): string {
    const jurisdictionContext = jurisdiction === 'us' ? {
      taxSystem: "United States federal and state tax system",
      currency: "USD",
      keyAreas: "federal income tax, state taxes, IRS codes, deductions, credits, retirement accounts (401k, IRA), business entity types (LLC, S-Corp, C-Corp), self-employment tax, estimated quarterly payments",
      commonDeductions: "home office, business expenses, equipment depreciation, professional development, business insurance, vehicle expenses, business meals",
      complianceItems: "Form 1040, Schedule C (business), quarterly estimated payments, state filing requirements, business license requirements"
    } : {
      taxSystem: "Indian tax system including Income Tax Act and GST",
      currency: "INR",
      keyAreas: "Income Tax Act sections, GST, TDS (Tax Deducted at Source), advance tax, ITR forms, professional tax, business registration, MSME benefits",
      commonDeductions: "Section 80C (ELSS, PPF, insurance), Section 80D (health insurance), home loan interest, professional expenses, business equipment",
      complianceItems: "ITR filing, GST returns, TDS compliance, advance tax payments, professional tax registration, business compliance certificates"
    };

    return `You are TaxThink AI, an expert tax thinking companion specializing in ${jurisdictionContext.taxSystem}. Your role is to help users think through tax situations systematically by asking contextual questions and providing structured guidance.

CONTEXT: ${jurisdictionContext.taxSystem} with ${jurisdictionContext.currency} currency.

KEY EXPERTISE AREAS:
${jurisdictionContext.keyAreas}

COMMON DEDUCTIONS & CREDITS:
${jurisdictionContext.commonDeductions}

COMPLIANCE REQUIREMENTS:
${jurisdictionContext.complianceItems}

YOUR APPROACH:
1. Ask targeted, contextual questions to gather necessary information
2. Break complex tax situations into manageable categories
3. Provide structured thinking frameworks
4. Identify optimization opportunities
5. Highlight compliance requirements and deadlines
6. Suggest actionable next steps

RESPONSE FORMAT:
Always respond with a JSON object containing:
{
  "content": "Your main response with structured guidance and questions",
  "thinkingMode": "Current analysis focus (e.g., 'Business Tax Optimization', 'Personal Deduction Planning')",
  "categories": ["relevant tax categories being discussed"],
  "actionItems": ["specific tasks the user should complete"],
  "keyInsights": ["important findings or opportunities identified"],
  "nextQuestions": ["follow-up questions to ask based on user's response"]
}

Remember to:
- Use ${currency.toUpperCase()} currency format
- Reference appropriate ${jurisdiction.toUpperCase()} tax codes and forms
- Consider jurisdiction-specific tax planning strategies
- Be professional but conversational
- Focus on practical, actionable guidance`;
  }

  async generateResponse(context: TaxContext): Promise<AIResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(context.jurisdiction, context.currency);
      
      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...context.conversationHistory,
        { role: "user" as const, content: context.userMessage }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000,
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        content: aiResponse.content || "I apologize, but I encountered an error processing your request. Please try again.",
        thinkingMode: aiResponse.thinkingMode || "General Tax Analysis",
        categories: aiResponse.categories || [],
        actionItems: aiResponse.actionItems || [],
        keyInsights: aiResponse.keyInsights || [],
        nextQuestions: aiResponse.nextQuestions || [],
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate AI response: " + (error as Error).message);
    }
  }

  async generateWelcomeMessage(jurisdiction: 'us' | 'in', currency: 'usd' | 'inr'): Promise<AIResponse> {
    const welcomeContext = jurisdiction === 'us' ? {
      jurisdiction: "United States",
      examples: "personal income tax, business deductions, retirement planning, state tax considerations"
    } : {
      jurisdiction: "India", 
      examples: "Income Tax Act compliance, GST planning, TDS optimization, business registration benefits"
    };

    return {
      content: `Welcome! I'm your AI thinking companion for tax-related matters. I'm currently configured for **${welcomeContext.jurisdiction}** tax jurisdiction with **${currency.toUpperCase()}** currency.

I can help you think through various tax scenarios including:
- Personal tax planning and optimization
- Business expense deductions and structuring  
- Compliance requirements and deadlines
- ${welcomeContext.examples}

What tax situation would you like to think through today? I'll ask contextual questions to help structure your thinking process.`,
      thinkingMode: "Welcome & Setup",
      categories: ["setup"],
      actionItems: ["Describe your tax situation or ask a specific question"],
      keyInsights: [`Configured for ${welcomeContext.jurisdiction} tax context`],
      nextQuestions: ["What specific tax area would you like to explore?"],
    };
  }
}

export const taxThinkingService = new TaxThinkingService();
