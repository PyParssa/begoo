import { Language, LanguageCode } from '../types/translation';

export const SUPPORTED_LANGUAGES: Record<LanguageCode, Language> = {
  fa: {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    flag: '🇮🇷',
    dir: 'rtl',
    voiceCode: 'fa-IR',
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    voiceCode: 'en-US',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    dir: 'ltr',
    voiceCode: 'es-ES',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
    voiceCode: 'fr-FR',
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    dir: 'ltr',
    voiceCode: 'de-DE',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    dir: 'rtl',
    voiceCode: 'ar-SA',
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    dir: 'ltr',
    voiceCode: 'tr-TR',
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    dir: 'ltr',
    voiceCode: 'it-IT',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    dir: 'ltr',
    voiceCode: 'ja-JP',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    dir: 'ltr',
    voiceCode: 'ko-KR',
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    dir: 'ltr',
    voiceCode: 'zh-CN',
  },
};

export const DEFAULT_PREFERENCES = {
  originLanguage: 'fa' as LanguageCode,
  targetLanguage: 'en' as LanguageCode,
  autoPlayAudio: true,
  casualTone: true, // Casual/Amiyaneh tone
  hapticFeedback: true,
};

export interface MultilingualSentence {
  formal: string;
  casual: string;
  transliteration?: string;
}

// Multilingual scenario phrases for all 11 supported languages
export const MULTILINGUAL_SCENARIOS: Array<Record<LanguageCode, MultilingualSentence>> = [
  // Scenario 1: Greetings & How are you
  {
    fa: {
      formal: 'سلام، حال شما چطور است؟ خوشحالم که شما را می‌بینم.',
      casual: 'سلام، چطوری؟ خوشحال شدم دیدمت.',
      transliteration: 'Salam, chetori? Khoshhal shodam didamet.',
    },
    en: {
      formal: 'Hello, how are you? It is a pleasure to see you.',
      casual: "Hey, how's it going? Great seeing you!",
    },
    es: {
      formal: 'Hola, ¿cómo está usted? Me alegro mucho de verle.',
      casual: '¡Hola! ¿Cómo estás? Qué bueno verte.',
    },
    fr: {
      formal: 'Bonjour, comment allez-vous ? Ravi de vous voir.',
      casual: 'Salut, ça va ? Trop content de te voir !',
    },
    de: {
      formal: 'Guten Tag, wie geht es Ihnen? Es freut mich, Sie zu sehen.',
      casual: "Hallo, wie geht's dir? Schön, dich zu sehen!",
    },
    ar: {
      formal: 'مرحباً، كيف حالك؟ يسعدني جداً لقاؤك.',
      casual: 'أهلاً، كيفك؟ مبسوط بشوفتك.',
      transliteration: 'Ahlan, kayfak? Mabsout bi-shoftak.',
    },
    tr: {
      formal: 'Merhaba, nasılsınız? Sizi gördüğüme çok sevindim.',
      casual: 'Selam, naber? Seni gördüğüme çok sevindim!',
    },
    it: {
      formal: 'Buongiorno, come sta? È un vero piacere vederla.',
      casual: 'Ciao, come butta? Che bello rivederti!',
    },
    ja: {
      formal: 'こんにちは、お元気ですか？お会いできて嬉しいです。',
      casual: 'やあ、元気にしてる？会えて嬉しいよ！',
      transliteration: 'Konnichiwa, ogenki desu ka? Oai dekite ureshii desu.',
    },
    ko: {
      formal: '안녕하세요, 어떻게 지내세요? 만나서 반갑습니다.',
      casual: '안녕, 잘 지내? 만나서 반가워!',
      transliteration: 'Annyeonghaseyo, eotteoke jinaeseyo?',
    },
    zh: {
      formal: '您好，您最近怎么样？很高兴见到您。',
      casual: '嗨，最近怎么样？见到你太高兴了！',
      transliteration: 'Nǐ hǎo, zuìjìn zěnmeyàng?',
    },
  },

  // Scenario 2: Directions / Nearest Station
  {
    fa: {
      formal: 'آیا ممکن است لطفاً آدرس نزدیک‌ترین ایستگاه مترو را بگویید؟',
      casual: 'میشه بگی نزدیک‌ترین مترو کجاست؟',
      transliteration: 'Misheh begi nazdiktarin metro kojast?',
    },
    en: {
      formal: 'Could you please direct me to the nearest metro station?',
      casual: 'Could you tell me where the nearest subway is?',
    },
    es: {
      formal: '¿Podría indicarme dónde se encuentra la estación de metro más cercana?',
      casual: '¿Me dices dónde queda el metro más cercano?',
    },
    fr: {
      formal: 'Pourriez-vous m’indiquer la station de métro la plus proche ?',
      casual: 'Tu peux me dire où est le métro le plus proche ?',
    },
    de: {
      formal: 'Könnten Sie mir bitte sagen, wo die nächste U-Bahn-Station ist?',
      casual: 'Kannst du mir sagen, wo hier die nächste U-Bahn ist?',
    },
    ar: {
      formal: 'هل يمكنك إرشادي إلى أقرب محطة مترو من فضلك؟',
      casual: 'ممكن تقولي وين أقرب محطة مترو؟',
      transliteration: 'Momken te-ouly wein aqrab mahatet metro?',
    },
    tr: {
      formal: 'Lütfen bana en yakın metro istasyonunu tarif edebilir misiniz?',
      casual: 'En yakın metro nerede acaba, söyleyebilir misin?',
    },
    it: {
      formal: 'Potrebbe indicarmi la stazione della metropolitana più vicina?',
      casual: 'Mi dici dov’è la metro più vicina?',
    },
    ja: {
      formal: '一番近い地下鉄の駅への行き方を教えていただけますか？',
      casual: '一番近い地下鉄の駅ってどこか教えてくれる？',
      transliteration: 'Ichiban chikai chikatetsu no eki wa doko desu ka?',
    },
    ko: {
      formal: '가장 가까운 지하철역이 어디인지 알려주시겠습니까?',
      casual: '가장 가까운 지하철역 어디인지 알려줄래?',
      transliteration: 'Gajang gakkaun jihacheol-yeogi eodi-inji allyeojusigessseumnikka?',
    },
    zh: {
      formal: '请问最近的地铁站在哪里，可以指引一下吗？',
      casual: '能告诉我最近的地铁站在哪儿吗？',
      transliteration: 'Qǐngwèn zuìjìn de dìtiězhàn zài nǎlǐ?',
    },
  },

  // Scenario 3: Price & Payment by Card
  {
    fa: {
      formal: 'قیمت این مورد چقدر است و آیا کارت اعتباری قبول می‌کنید؟',
      casual: 'قیمت این چنده؟ کارت هم قبول می‌کنین؟',
      transliteration: 'Gheymat-e in chandeh? Kart ham ghabool mikonin?',
    },
    en: {
      formal: 'What is the price of this item, and do you accept credit cards?',
      casual: 'How much is this, and do you take cards?',
    },
    es: {
      formal: '¿Cuál es el precio de este artículo y aceptan tarjeta de crédito?',
      casual: '¿Cuánto cuesta esto? ¿Aceptan tarjeta?',
    },
    fr: {
      formal: 'Quel est le prix de cet article et acceptez-vous les cartes de crédit ?',
      casual: 'C’est combien ça ? Vous prenez la carte ?',
    },
    de: {
      formal: 'Wie viel kostet dieser Artikel und akzeptieren Sie Kreditkarten?',
      casual: 'Was kostet das und geht hier Kartenzahlung?',
    },
    ar: {
      formal: 'ما هو سعر هذا المنتج وهل تقبلون بطاقات الائتمان؟',
      casual: 'بكم هذا؟ وتقبلون كرت؟',
      transliteration: 'Bikam hatha? Wa teqbaloon kart?',
    },
    tr: {
      formal: 'Bu ürünün fiyatı ne kadar ve kredi kartı kabul ediyor musunuz?',
      casual: 'Bu ne kadar? Kart geçiyor mu?',
    },
    it: {
      formal: 'Quanto costa questo articolo e accettate carte di credito?',
      casual: 'Quanto viene questo? Accettate la carta?',
    },
    ja: {
      formal: 'こちらはおいくらですか？クレジットカードは使えますか？',
      casual: 'これいくら？カード使える？',
      transliteration: 'Kore wa oikura desu ka? Kaado wa tsukaemasu ka?',
    },
    ko: {
      formal: '이 제품은 얼마이며, 신용카드 결제가 가능합니까?',
      casual: '이거 얼마예요? 카드 결제 돼요?',
      transliteration: 'I jepumeun eolma-imyeo, sinyongkadeu gyeoljega ganeunghabnikka?',
    },
    zh: {
      formal: '请问这个多少钱，可以刷信用卡吗？',
      casual: '这个多少钱？能刷卡吗？',
      transliteration: 'Zhège duōshao qián? Néng shuākǎ ma?',
    },
  },

  // Scenario 4: Gratitude & Polite farewell
  {
    fa: {
      formal: 'خیلی ممنون از کمک صمیمانه شما، روز بسیار خوبی داشته باشید.',
      casual: 'دستت درد نکنه، خیلی لطف کردی. روزت خوش!',
      transliteration: 'Dastet dard nakoneh, kheyli lotf kardi. Roozet khosh!',
    },
    en: {
      formal: 'Thank you very much for your kind assistance. Have a wonderful day.',
      casual: 'Thanks so much, really appreciate the help. Have a good one!',
    },
    es: {
      formal: 'Muchas gracias por su amable ayuda. Que tenga un excelente día.',
      casual: '¡Mil gracias por la ayuda! Que tengas un gran día.',
    },
    fr: {
      formal: 'Merci infiniment pour votre aide bienveillante. Passez une excellente journée.',
      casual: 'Merci beaucoup pour le coup de main, bonne journée !',
    },
    de: {
      formal: 'Vielen Dank für Ihre freundliche Hilfe. Ich wünsche Ihnen einen schönen Tag.',
      casual: 'Vielen Dank für die Hilfe! Schönen Tag noch!',
    },
    ar: {
      formal: 'شكراً جزيلاً على مساعدتك الكريمة، أتمنى لك يوماً رائعاً.',
      casual: 'تسلم كثير ع المساعدة، يعطيك ألف عافية!',
      transliteration: 'Tislam kateer aal-mosaadah, yaatik alf aafiyeh!',
    },
    tr: {
      formal: 'Nazik yardımınız için çok teşekkür ederim. İyi günler dilerim.',
      casual: 'Yardımın için çok sağ ol, iyi günler!',
    },
    it: {
      formal: 'La ringrazio molto per il suo gentile aiuto. Le auguro una buona giornata.',
      casual: 'Grazie mille dell’aiuto! Buona giornata!',
    },
    ja: {
      formal: 'ご親切に助けていただき、本当にありがとうございます。良い一日をお過ごしください。',
      casual: '助けてくれてありがとう！良い一日をね！',
      transliteration: 'Tasukete kurete arigatou! Yoi ichinichi o!',
    },
    ko: {
      formal: '친절하게 도와주셔서 진심으로 감사드립니다. 좋은 하루 보내십시오.',
      casual: '도와줘서 정말 고마워! 좋은 하루 보내!',
      transliteration: 'Dowajwoseo jeongmal gomawod! Joeun haru bonae!',
    },
    zh: {
      formal: '非常感谢您的热情帮助，祝您度过美好的一天。',
      casual: '太感谢你的帮忙了，祝你今天过得开心！',
      transliteration: 'Fēicháng gǎnxiè nín de bāngzhù, zhù nín dùguò měihǎo de yītiān.',
    },
  },

  // Scenario 5: Restaurant & Table reservation
  {
    fa: {
      formal: 'من مایل به رزرو میز برای دو نفر در ساعت هشت هستم.',
      casual: 'واسه ساعت هشت یه میز دونفره می‌خوام.',
      transliteration: 'Vaseh sa’at-e hasht ye miz-e do nafareh mikham.',
    },
    en: {
      formal: 'I would like to reserve a table for two persons at eight o’clock.',
      casual: 'Can I get a table for two at around eight?',
    },
    es: {
      formal: 'Quisiera reservar una mesa para dos personas a las ocho.',
      casual: 'Quería reservar una mesa para dos a eso de las ocho.',
    },
    fr: {
      formal: 'Je souhaiterais réserver une table pour deux personnes à huit heures.',
      casual: 'Je voudrais réserver une table pour deux vers vingt heures.',
    },
    de: {
      formal: 'Ich möchte gerne einen Tisch für zwei Personen um acht Uhr reservieren.',
      casual: 'Ich hätte gern einen Tisch für zwei um acht.',
    },
    ar: {
      formal: 'أود حجز طاولة لشخصين في تمام الساعة الثامنة.',
      casual: 'بدي طاولة لشخصين ع الساعة تمانية.',
      transliteration: 'Baddi tawleh li-shakhsayn aal-sa’a tamanya.',
    },
    tr: {
      formal: 'Saat sekiz için iki kişilik bir masa rezerve etmek istiyorum.',
      casual: 'Saat sekize iki kişilik bir masa ayırtabilir miyim?',
    },
    it: {
      formal: 'Vorrei prenotare un tavolo per due persone per le otto.',
      casual: 'Vorrei un tavolo per due verso le otto, è possibile?',
    },
    ja: {
      formal: '8時に2名でテーブルの予約をお願いしたいのですが。',
      casual: '8時に2人で席を予約できる？',
      transliteration: 'Hachiji ni futari de seki o yoyaku dekimasu ka?',
    },
    ko: {
      formal: '8시에 2인 테이블을 예약하고 싶습니다.',
      casual: '8시에 두 명 자리 예약할 수 있을까?',
      transliteration: 'Yeodeolsi-e i-in te-ibeul-eul yeyaghago sipsumnida.',
    },
    zh: {
      formal: '我想预订今晚八点两人位的餐桌。',
      casual: '我想订今晚八点两个人的桌子。',
      transliteration: 'Wǒ xiǎng yùdìng jīnwǎn bādiǎn liǎngrén wèi de cānzhuō.',
    },
  },
];
