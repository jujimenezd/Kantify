// API Client para comunicarse con el backend FastAPI RAG
const RAG_API_BASE_URL =
  process.env.NEXT_PUBLIC_RAG_API_URL || "http://localhost:8000";

export interface RAGDilemmaRequest {
  topic: string;
  intensity: string;
  user_context?: string;
}

export interface RAGDilemmaResponse {
  success: boolean;
  dilemma_text: string;
  philosophical_foundation: string;
  used_sources: string[];
  hidden_variable: string;
  topic: string;
  intensity: string;
  sources_metadata: string[];
  generation_time_ms?: number;
}

export interface RAGTopicsResponse {
  topics: string[];
  intensities: string[];
}

export interface RAGHealthResponse {
  status: string;
  rag_status: string;
  available_topics: number;
}

export class RAGApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = RAG_API_BASE_URL, timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          "Request timeout - RAG server might be slow or unavailable"
        );
      }
      throw error;
    }
  }

  async generateDilemma(
    request: RAGDilemmaRequest
  ): Promise<RAGDilemmaResponse> {
    return this.makeRequest<RAGDilemmaResponse>("/generate-dilemma", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getAvailableTopics(): Promise<RAGTopicsResponse> {
    return this.makeRequest<RAGTopicsResponse>("/topics");
  }

  async checkHealth(): Promise<RAGHealthResponse> {
    return this.makeRequest<RAGHealthResponse>("/health");
  }
}

// Instancia singleton
export const ragApiClient = new RAGApiClient();
