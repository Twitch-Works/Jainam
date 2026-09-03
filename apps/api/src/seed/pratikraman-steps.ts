// ⚠️  Pratikramaṇa steps — AI-drafted scaffold, unverified. See REVIEW.md §1.
// Copied verbatim from the original mobile mock so the seed stays reviewable.
import type { PratikramanStep } from "@jainam/shared";

const NAVKAR =
  "Namo Arihantāṇaṁ · Namo Siddhāṇaṁ · Namo Āyariyāṇaṁ · Namo Uvajjhāyāṇaṁ · " +
  "Namo Loe Savva-sāhūṇaṁ · Eso pañca-namokkāro, savva-pāva-ppaṇāsaṇo, " +
  "maṅgalāṇaṁ ca savvesiṁ, paḍhamaṁ havai maṅgalaṁ.";

const KHAMEMI =
  "Khāmemi savva-jīve, savve jīvā khamantu me · mittī me savva-bhūesu, veraṁ majjha na keṇaī.";

/**
 * Complete Version — 48 steps. A summary-level walk-through of the full
 * evening pratikramaṇa. (Traditional recitation has more discrete sūtras;
 * some are grouped here — see header note.)
 */
export const completePratikraman: PratikramanStep[] = [
  // ── Preparation & 1st Āvaśyaka: Sāmāyika ──────────────────────────────
  {
    id: "c01",
    phase: "Preparation",
    title: "Navkār Mantra",
    instruction: "Sit facing east or north. Recite the Namaskāra Mantra three times, settling the mind.",
    recitation: NAVKAR,
  },
  {
    id: "c02",
    phase: "Preparation",
    title: "Panchindiya Sutra",
    instruction: "Establish the guru (sthāpanā) by reciting the Panchindiya sūtra, which enumerates the 36 qualities of an ācārya.",
  },
  {
    id: "c03",
    phase: "Preparation",
    title: "Khamāsamaṇa",
    instruction: "Offer obeisance — 'Icchāmi khamāsamaṇo…' — bowing with the five-limbed praṇāma.",
  },
  {
    id: "c04",
    phase: "Preparation",
    title: "Icchakāra Sutra",
    instruction: "Inquire respectfully after the well-being (sukha-sātā) of the guru.",
  },
  {
    id: "c05",
    phase: "Preparation",
    title: "Abbhuṭṭhio Sutra",
    instruction: "Seek forgiveness from the guru for any disrespect in thought, word or deed.",
  },
  {
    id: "c06",
    phase: "Sāmāyika",
    title: "Iriyāvahiyaṃ Sutra",
    instruction: "Repent harm caused to living beings while walking, standing or moving during the day (iryāpathikī pratikramaṇa).",
  },
  {
    id: "c07",
    phase: "Sāmāyika",
    title: "Tassa Uttarī Sutra",
    instruction: "Resolve to further purify the soul through repentance, self-criticism and renunciation of faults.",
  },
  {
    id: "c08",
    phase: "Sāmāyika",
    title: "Annattha Sutra",
    instruction: "Acknowledge the involuntary bodily exceptions (breath, cough, etc.) permitted during Kāyotsarga.",
  },
  {
    id: "c09",
    phase: "Sāmāyika",
    title: "Kāyotsarga — one Logassa",
    instruction: "Stand still in kāyotsarga, silently contemplating one Logassa up to 'chandesu nimmalayarā'.",
  },
  {
    id: "c10",
    phase: "Sāmāyika",
    title: "Logassa Sutra",
    instruction: "Recite the Logassa aloud — praise of the twenty-four Tīrthaṅkaras (Chauvīsattho, the 2nd Āvaśyaka).",
    recitation:
      "Logassa ujjoyagare, dhamma-titthayare jiṇe · arihaṁte kittaïssaṁ, chauvīsaṁ pi kevalī… (opening only — verify full text)",
  },
  {
    id: "c11",
    phase: "Sāmāyika",
    title: "Karemi Bhante Sutra",
    instruction: "Take the Sāmāyika vow — renouncing sinful activity for the duration of the rite.",
    recitation:
      "Karemi bhante! sāmāiyaṁ, sāvajjaṁ jogaṁ paccakkhāmi… (opening only — verify full text)",
  },
  {
    id: "c12",
    phase: "Sāmāyika",
    title: "Sāmāyika Paṭha",
    instruction: "Recite 'Sāmāiya-vaya-jutto…', affirming equanimity toward all beings.",
  },

  // ── 2nd Āvaśyaka: Chaturviṃśati-stava / Chaityavandan ────────────────
  {
    id: "c13",
    phase: "Chaturviṃśati-stava",
    title: "Jaṅkiṃci Sutra",
    instruction: "Offer homage to all Jina shrines and images across the three worlds.",
  },
  {
    id: "c14",
    phase: "Chaturviṃśati-stava",
    title: "Namuṭṭhuṇaṃ (Śakrastava)",
    instruction: "Recite the 33-fold praise of the Arihanta as offered by Śakra (Indra).",
  },
  {
    id: "c15",
    phase: "Chaturviṃśati-stava",
    title: "Jāvanti Cheiāiṃ",
    instruction: "Bow to all Jina images in every direction.",
  },
  {
    id: "c16",
    phase: "Chaturviṃśati-stava",
    title: "Jāvanta Kevi Sāhū",
    instruction: "Bow to all sādhus and sādhvīs practising right conduct.",
  },
  {
    id: "c17",
    phase: "Chaturviṃśati-stava",
    title: "Namo'rhat & Stavan",
    instruction: "Recite 'Namo'rhat-siddhācāryopādhyāya-sarva-sādhubhyaḥ' and a stavan in praise of the Jina.",
  },
  {
    id: "c18",
    phase: "Chaturviṃśati-stava",
    title: "Uvasaggaharaṃ Stotra",
    instruction: "Recite the Uvasaggaharaṃ Stotra to Pārśvanātha for removal of obstacles.",
  },
  {
    id: "c19",
    phase: "Chaturviṃśati-stava",
    title: "Jaya Vīyarāya Sutra",
    instruction: "Pray for detachment, right conduct and eventual liberation ('prārthanā sūtra').",
  },

  // ── Devasi Pratikramaṇa establishment ───────────────────────────────
  {
    id: "c20",
    phase: "Pratikramaṇa",
    title: "Karemi Bhante (for the day)",
    instruction: "Re-establish the vow, now directed at repentance for the day just passed (devasiaṃ).",
  },
  {
    id: "c21",
    phase: "Pratikramaṇa",
    title: "Icchāmi Ṭhāmi Kāussaggaṃ",
    instruction: "Declare the intention to stand in kāyotsarga to review the day's transgressions.",
  },
  {
    id: "c22",
    phase: "Pratikramaṇa",
    title: "Tassa Uttarī & Annattha",
    instruction: "Repeat the purification resolve and the permitted-exceptions formula.",
  },
  {
    id: "c23",
    phase: "Kāyotsarga",
    title: "Kāyotsarga — recollect the day",
    instruction: "Stand silently through two Logassa, honestly recalling faults of thought, speech and action since dawn.",
  },
  {
    id: "c24",
    phase: "Chaturviṃśati-stava",
    title: "Logassa (aloud)",
    instruction: "Complete the kāyotsarga by reciting the Logassa aloud.",
  },

  // ── 3rd Āvaśyaka: Vandana ───────────────────────────────────────────
  {
    id: "c25",
    phase: "Vandana",
    title: "Dvādaśāvarta Vandana",
    instruction: "Offer the twelve-fold reverence to the guru with the 25 āvaśyaka (prescribed movements and pauses).",
  },
  {
    id: "c26",
    phase: "Vandana",
    title: "Seek permission to confess",
    instruction: "'Icchākāreṇa saṁdisaha bhagavan devasiaṁ āloiuṁ' — request leave to make the confession.",
  },
  {
    id: "c27",
    phase: "Vandana",
    title: "84-Lākh Jīvayoni",
    instruction: "Ask forgiveness of every class of living being (the 8.4 million yonis) harmed knowingly or unknowingly.",
    recitation: KHAMEMI,
  },
  {
    id: "c28",
    phase: "Vandana",
    title: "Aṭhāra Pāpsthānak",
    instruction: "Repent the eighteen sinful activities (hiṁsā, mṛṣā, steya, … through mithyātva-śalya).",
  },
  {
    id: "c29",
    phase: "Vandana",
    title: "Sabbassavi Sutra",
    instruction: "Make the general confession of all ill-conceived, ill-spoken and ill-done acts of the day.",
  },

  // ── 4th Āvaśyaka: Pratikramaṇa proper ───────────────────────────────
  {
    id: "c30",
    phase: "Pratikramaṇa",
    title: "Karemi Bhante (pratikramaṇa)",
    instruction: "Re-establish the vow to begin the formal repentance.",
  },
  {
    id: "c31",
    phase: "Pratikramaṇa",
    title: "Icchāmi Paḍikkamiuṃ",
    instruction: "Repeat the iryāpathikī repentance for harm caused while moving.",
  },
  {
    id: "c32",
    phase: "Pratikramaṇa",
    title: "Vandittu Sutra",
    instruction: "Recite the Śrāvaka Pratikramaṇa Sūtra (Vandittu) — the principal confession covering the layperson's vows.",
  },
  {
    id: "c33",
    phase: "Pratikramaṇa",
    title: "Samyaktva — atichār",
    instruction: "Repent lapses in right faith: doubt (śaṅkā), craving for other paths (kāṅkṣā), disgust (vicikitsā), praise of the misguided, and their company.",
  },
  {
    id: "c34",
    phase: "Pratikramaṇa",
    title: "1st Aṇuvrata — Ahiṁsā",
    instruction: "Repent transgressions of gross non-violence (Sthūla Prāṇātipāta Viramaṇa): binding, beating, mutilating, overloading, withholding food or water.",
  },
  {
    id: "c35",
    phase: "Pratikramaṇa",
    title: "2nd Aṇuvrata — Satya",
    instruction: "Repent transgressions of truthfulness (Sthūla Mṛṣāvāda Viramaṇa): false counsel, betrayal of confidence, forgery, false testimony.",
  },
  {
    id: "c36",
    phase: "Pratikramaṇa",
    title: "3rd Aṇuvrata — Asteya",
    instruction: "Repent transgressions of non-stealing (Sthūla Adattādāna Viramaṇa): receiving stolen goods, smuggling, false weights, adulteration.",
  },
  {
    id: "c37",
    phase: "Pratikramaṇa",
    title: "4th Aṇuvrata — Brahmacarya",
    instruction: "Repent transgressions of chastity / contentment with one's spouse (Svadāra-Santoṣa).",
  },
  {
    id: "c38",
    phase: "Pratikramaṇa",
    title: "5th Aṇuvrata — Aparigraha",
    instruction: "Repent exceeding the self-set limits on wealth, land, goods, animals and dependents (Parigraha Parimāṇa).",
  },
  {
    id: "c39",
    phase: "Pratikramaṇa",
    title: "6th Vrata — Dik Parimāṇa",
    instruction: "Repent breaching the vowed limits on travel in each direction (1st guṇavrata).",
  },
  {
    id: "c40",
    phase: "Pratikramaṇa",
    title: "7th Vrata — Bhogopabhoga Parimāṇa",
    instruction: "Repent transgressions in the limits on consumable and re-usable objects, and in livelihood (2nd guṇavrata).",
  },
  {
    id: "c41",
    phase: "Pratikramaṇa",
    title: "8th Vrata — Anartha-daṇḍa Viramaṇa",
    instruction: "Repent purposeless harmful activity (3rd guṇavrata): idle malice, careless speech, supplying weapons, purposeless destruction.",
  },
  {
    id: "c42",
    phase: "Pratikramaṇa",
    title: "9th Vrata — Sāmāyika",
    instruction: "Repent lapses in the practice of sāmāyika (1st śikṣāvrata): wandering mind, wrong speech, wrong action, inattention, forgetfulness.",
  },
  {
    id: "c43",
    phase: "Pratikramaṇa",
    title: "10th Vrata — Deśāvakāśika",
    instruction: "Repent breaching the daily narrowing of one's field of activity (2nd śikṣāvrata).",
  },
  {
    id: "c44",
    phase: "Pratikramaṇa",
    title: "11th–12th Vrata & Saṃlekhanā",
    instruction: "Repent lapses in Pauṣadha (3rd śikṣāvrata), Atithi-Saṃvibhāga — sharing with ascetics (4th śikṣāvrata) — and in the resolve of Saṃlekhanā.",
  },

  // ── 5th Āvaśyaka: Kāyotsarga ───────────────────────────────────────
  {
    id: "c45",
    phase: "Kāyotsarga",
    title: "Kāyotsarga — cāritra śuddhi",
    instruction: "Stand through two Logassa for purification of conduct.",
  },
  {
    id: "c46",
    phase: "Kāyotsarga",
    title: "Kāyotsarga — jñāna & darśana",
    instruction: "Kāyotsarga with Śruta-devatā and Kṣetra-devatā stuti, for right knowledge and the welfare of the assembly.",
  },

  // ── 6th Āvaśyaka: Pratyākhyāna ─────────────────────────────────────
  {
    id: "c47",
    phase: "Pratyākhyāna",
    title: "Pachchakhāṇ",
    instruction: "Take a renunciation for the coming period — e.g. cauvvihār (no food or water till dawn), tivihār, or a chosen restraint.",
  },

  // ── Conclusion ────────────────────────────────────────────────────
  {
    id: "c48",
    phase: "Conclusion",
    title: "Sajjhāya & Kṣamāpaṇā",
    instruction: "Close with sajjhāya, a stavan, Sakalatīrtha Vandanā, and mutual forgiveness — 'Micchāmi Dukkaḍaṁ'.",
    recitation: KHAMEMI,
  },
];
export const briefPratikraman: PratikramanStep[] = [
  {
    id: "b01",
    phase: "Preparation",
    title: "Navkār Mantra",
    instruction: "Settle into a still posture and recite the Namaskāra Mantra three times.",
    recitation: NAVKAR,
  },
  {
    id: "b02",
    phase: "Preparation",
    title: "Panchindiya Sutra",
    instruction: "Establish the guru with the Panchindiya sūtra.",
  },
  {
    id: "b03",
    phase: "Sāmāyika",
    title: "Iriyāvahiyaṃ Sutra",
    instruction: "Repent harm to any living being caused while moving through the day.",
  },
  {
    id: "b04",
    phase: "Sāmāyika",
    title: "Tassa Uttarī, Annattha & Kāyotsarga",
    instruction: "Make the purification resolve, then stand in kāyotsarga for one silent Logassa.",
  },
  {
    id: "b05",
    phase: "Chaturviṃśati-stava",
    title: "Logassa Sutra",
    instruction: "Recite the Logassa aloud — homage to the twenty-four Tīrthaṅkaras.",
    recitation:
      "Logassa ujjoyagare, dhamma-titthayare jiṇe… (opening only — verify full text)",
  },
  {
    id: "b06",
    phase: "Sāmāyika",
    title: "Karemi Bhante Sutra",
    instruction: "Take the Sāmāyika vow, renouncing sinful activity for the rite.",
    recitation: "Karemi bhante! sāmāiyaṁ, sāvajjaṁ jogaṁ paccakkhāmi… (opening only — verify)",
  },
  {
    id: "b07",
    phase: "Chaturviṃśati-stava",
    title: "Namuṭṭhuṇaṃ (Śakrastava)",
    instruction: "Recite the 33-fold praise of the Arihanta.",
  },
  {
    id: "b08",
    phase: "Vandana",
    title: "Dvādaśāvarta Vandana",
    instruction: "Offer the twelve-fold reverence to the guru.",
  },
  {
    id: "b09",
    phase: "Vandana",
    title: "84-Lākh Jīvayoni & 18 Pāpsthānak",
    instruction: "Ask forgiveness of every class of being, and repent the eighteen sinful activities.",
    recitation: KHAMEMI,
  },
  {
    id: "b10",
    phase: "Pratikramaṇa",
    title: "Vandittu Sutra",
    instruction: "Recite the Śrāvaka Pratikramaṇa Sūtra, confessing transgressions of the twelve vows of a layperson.",
  },
  {
    id: "b11",
    phase: "Kāyotsarga",
    title: "Kāyotsarga — cāritra śuddhi",
    instruction: "Stand through two Logassa for purification of conduct.",
  },
  {
    id: "b12",
    phase: "Pratyākhyāna",
    title: "Pachchakhāṇ & Kṣamāpaṇā",
    instruction: "Take a renunciation for the period ahead and close with mutual forgiveness — 'Micchāmi Dukkaḍaṁ'.",
    recitation: KHAMEMI,
  },
];
