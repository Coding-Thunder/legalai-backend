// File: backend/services/aiService.js
/**
 * AI Service (pluggable)
 *
 * Provides interface for:
 * - generateDraft({ caseId, lawyerId, petitionType, facts })
 *
 * Notes:
 * - Placeholder for RAG pipeline + LLM integration (OpenAI/LLaMA)
 * - Returns: { content, aiMetadata }
 * - Currently returns dummy content
 */

const generateDraft = async ({ caseId, lawyerId, petitionType, facts }) => {
  // TODO: Implement RAG pipeline here
  // - Fetch case data
  // - Fetch templates / precedent
  // - Create vector embeddings
  // - Query embeddings for relevant context
  // - Call LLM with context + facts
  // - Return content + metadata

  const content = `AI-generated draft for petitionType: ${petitionType} with facts: ${facts}`;

  const aiMetadata = {
    model: 'dummy-model',
    vectorSource: 'local',
    tokensUsed: 42,
  };

  return { content, aiMetadata };
};

module.exports = {
  generateDraft,
};
