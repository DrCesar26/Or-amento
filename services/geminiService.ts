import { GoogleGenAI } from "@google/genai";
import { Transaction, Category, BankAccount } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  async getFinancialAdvice(
    query: string, 
    transactions: Transaction[], 
    accounts: BankAccount[],
    categories: Category[]
  ): Promise<string> {
    
    // Prepare context for the AI
    const financialContext = JSON.stringify({
      totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
      recentTransactions: transactions.slice(0, 20),
      accountsSummary: accounts.map(a => ({ name: a.name, balance: a.balance })),
      categoryStructure: categories.map(c => c.name)
    });

    const systemPrompt = `
      Você é um consultor financeiro futurista e inteligente do app "NeonFinance".
      Seu tom é profissional, direto e encorajador.
      Use os dados fornecidos em JSON para responder à pergunta do usuário.
      Se a pergunta for genérica, dê dicas financeiras baseadas no saldo atual.
      Não mencione que você está lendo um JSON, apenas aja como se conhecesse a vida financeira do usuário.
      Formate a resposta usando Markdown simples.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Contexto Financeiro: ${financialContext}\n\nPergunta do Usuário: ${query}`,
        config: {
          systemInstruction: systemPrompt,
          thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster chat response
        }
      });
      return response.text || "Desculpe, não consegui analisar seus dados no momento.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Houve um erro ao conectar com o assistente inteligente. Verifique sua chave de API.";
    }
  }
};