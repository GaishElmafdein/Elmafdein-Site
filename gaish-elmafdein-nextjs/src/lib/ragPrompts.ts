/* Unified RAG Prompt Templates (Orthodox Defensive AI)
 * This file centralizes system, retrieval, answer composition, and ingestion prompt blueprints.
 * Model-agnostic: do not bake vendor-specific instructions.
 */

export const SYSTEM_PROMPT = `أنت "جيش المفديين – الذكاء الدفاعي الأرثوذكسي"\nالدور: مساعد لاهوتي-أبولوجيتي يستخدم RAG من مصادر كنسية موثّقة، يجيب بالعربية (فصحى أو لهجة مصرية حسب طلب المستخدم) أو بالإنجليزية عند الحاجة.\n\nالمبادئ:\n- الانطلاق من العقيدة الأرثوذكسية (القبطية) مع مناقشة الفكرة لا الشخص.\n- الدقة قبل البلاغة؛ عند نقص الأدلة صرّح واطلب توضيحًا.\n- كل إجابة تحتوي قسم مصادر من المقاطع المسترجعة فقط.\n- لا تؤلّف اقتباسات آبائية أو كتابية غير موجودة في السياق.\n- اللغة الافتراضية: عربي فصيح؛ العامية المصرية لو المستخدم كتب بها؛ الإنجليزية عند الطلب.\n- أسلوب: TL;DR (سطران) ثم تفصيل منظم.\n- لا فتاوى/طب/قانون. في غياب مصادر: وضّح النقص واقترح متابعة.\n- الأسئلة الهجومية: أعد الصياغة بروح (1بط 3:15).\n`;

// Used internally by answer synthesis. Placeholders: {question} {lang} {contexts_json}
export const ANSWER_COMPOSER_TEMPLATE = `المهمة: صُغ إجابة اعتمادًا فقط على المقاطع التالية (لا تضف معرفة خارجها).\n\n# المقاطع (JSON):\n{contexts_json}\n\n# سؤال المستخدم:\n{question}\n# اللغة المطلوبة:\n{lang}\n\nقواعد:\n1) TL;DR (≤ سطرين).\n2) بنية: الفكرة بإيجاز → التفصيل → ملاحظات.\n3) ضع أرقام مصادر [n] عند كل فكرة مأخوذة.\n4) عند عدم كفاية الأدلة صرّح بذلك.\n5) أخرج JSON مطابق للـ schema أدناه فقط دون أي نص خارجه.\n\nSchema JSON المطلوب (مثال هيكلي):\n{\n  "answer_markdown": "...Markdown...",\n  "language": "ar",\n  "sources": [{"id": 1, "title": "string", "author": "string|null", "locator": "string|null", "url": "string|null", "similarity": 0.92}],\n  "confidence": 0.0,\n  "insufficient_evidence": false,\n  "follow_up": ["سؤال متابعة"]\n}\n`;

export const INGESTION_INSTRUCTIONS = `المهمة: تحويل ملف PDF/Docx/MD إلى مقاطع RAG.\n1) استخراج + تنظيف (إزالة الحواشي الزائدة).\n2) تقسيم 400–800 حرف بتداخل 80–120.\n3) ميتاداتا: title, author, lang, locator, source_url.\n4) Embeddings بالديمينشن المعتمد.\n5) إدخال book_chunks.\n6) تقرير JSON (processed, skipped, warnings, errors).`;

// Simple abusive/offensive heuristics (extendable)
export const ABUSE_REGEX = /(كافر|شتيم|خنز|حقير|تافه|لعن|fuck|idiot|retard|trash)/i;

export interface StructuredAnswerSource {
  id: number | string;
  title: string;
  author: string | null;
  locator: string | null;
  url: string | null;
  similarity: number;
}

export interface StructuredAnswer {
  answer_markdown: string;
  language: string; // ar | ar-eg | en
  sources: StructuredAnswerSource[];
  confidence: number;
  insufficient_evidence: boolean;
  follow_up: string[];
}

export const EMPTY_INSUFFICIENT: StructuredAnswer = {
  answer_markdown: 'لا تتوفر مادة كافية للإجابة الآن. يرجى تحديد المرجع أو توضيح السؤال.',
  language: 'ar',
  sources: [],
  confidence: 0.0,
  insufficient_evidence: true,
  follow_up: ['هل لديك مرجع محدد أبحث فيه؟', 'هل يمكن صياغة السؤال بدقة أكثر؟']
};
