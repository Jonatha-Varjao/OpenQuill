import { describe, it, expect, beforeEach, afterEach, vi } from 'bun:test';
import { parseSuggestions } from './useInlineAnalysis';

describe('useInlineAnalysis', () => {
  describe('parseSuggestions', () => {
    it('should parse valid JSON array of suggestions', () => {
      const response = '[{"start": 0, "end": 3, "type": "spelling", "original": "teh", "suggestion": "the"}]';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        start: 0,
        end: 3,
        type: 'spelling',
        original: 'teh',
        suggestion: 'the',
      });
    });

    it('should parse multiple suggestions', () => {
      const response = '[{"start": 0, "end": 3, "type": "spelling", "original": "teh", "suggestion": "the"}, {"start": 4, "end": 9, "type": "grammar", "original": "isnt", "suggestion": "isnt"}]';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(2);
      expect(result[0].original).toBe('teh');
      expect(result[1].original).toBe('isnt');
    });

    it('should handle suggestions with different types', () => {
      const response = '[{"start": 0, "end": 3, "type": "grammar", "original": "teh", "suggestion": "the"}]';
      const result = parseSuggestions(response);

      expect(result[0].type).toBe('grammar');
    });

    it('should filter out invalid suggestions missing required fields', () => {
      const response = '[{"start": 0, "end": 3, "type": "spelling", "original": "teh", "suggestion": "the"}, {"start": 5, "end": 8}]';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(1);
      expect(result[0].original).toBe('teh');
    });

    it('should filter out suggestions with invalid type values', () => {
      const response = '[{"start": 0, "end": 3, "type": "spelling", "original": "teh", "suggestion": "the"}, {"start": 5, "end": 8, "type": "invalid", "original": "bad", "suggestion": "good"}]';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(1);
    });

    it('should filter out suggestions where start/end are not numbers', () => {
      const response = '[{"start": "a", "end": 3, "type": "spelling", "original": "teh", "suggestion": "the"}]';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(0);
    });

    it('should return empty array for non-array JSON responses', () => {
      const response = '{"start": 0, "end": 3, "type": "spelling"}';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(0);
    });

    it('should return empty array for invalid JSON', () => {
      const response = 'not valid json at all';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(0);
    });

    it('should handle markdown code block format with json', () => {
      const response = '```json\n[{"start": 0, "end": 3, "type": "spelling", "original": "teh", "suggestion": "the"}]\n```';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(1);
      expect(result[0].original).toBe('teh');
    });

    it('should handle markdown code block format without json label', () => {
      const response = '```\n[{"start": 0, "end": 3, "type": "spelling", "original": "teh", "suggestion": "the"}]\n```';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(1);
    });

    it('should handle whitespace trimmed response', () => {
      const response = '   [{"start": 0, "end": 3, "type": "spelling", "original": "teh", "suggestion": "the"}]   ';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const response = '[]';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(0);
    });

    it('should allow empty suggestion string (for deletions)', () => {
      const response = '[{"start": 0, "end": 3, "type": "style", "original": "very", "suggestion": ""}]';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(1);
      expect(result[0].suggestion).toBe('');
    });

    it('should allow empty original string', () => {
      const response = '[{"start": 0, "end": 3, "type": "spelling", "original": "", "suggestion": "the"}]';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(1);
      expect(result[0].original).toBe('');
    });

    it('should allow empty suggestion string (for deletions)', () => {
      const response = '[{"start": 0, "end": 3, "type": "style", "original": "very", "suggestion": ""}]';
      const result = parseSuggestions(response);

      expect(result).toHaveLength(1);
      expect(result[0].suggestion).toBe('');
    });
  });
});