// Tezos utility functions
import tezosReducer from './tezos-reducer.js';


// string functions
export const string = {

  // minify string
  minify(s) {
    return s.trim().replace(/\s*\n\s*/g, '\n');
  }

};


// datetime formatting
function datetimeFormat(date, format) {
  let d = date instanceof Date ? date : new Date(date);
  return Intl.DateTimeFormat( tezosReducer.locale || [], format ).format(d);
}


// localised datetime functions
export const datetime = {

  zone: [
    // https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    'UTC',
    'Europe/London',
    'Europe/Paris',
    'Europe/Zurich',
    'Europe/Athens',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Melbourne',
    'US/Pacific',
    'US/Mountain',
    'US/Central',
    'US/Eastern'
  ],

  formatTime: {

    // HH:MM:SS
    long(date, timeZone, hour12) {
      return datetimeFormat(date, { timeZone, 'hour12': !!hour12, hour:'2-digit', minute: '2-digit', second: 'numeric' });
    },

    // HH:MM
    short(date, timeZone, hour12) {
      return datetimeFormat(date, { timeZone, 'hour12': !!hour12, hour:'2-digit', minute: '2-digit' });
    }

  },

  formatDate: {

    // WWWW, D MMMM YYYY
    long(date, timeZone) {
      return datetimeFormat(date, { timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    },

    // D MMMM YYYY
    medium(date, timeZone) {
      return datetimeFormat(date, { timeZone, day: 'numeric', month: 'long', year: 'numeric' });
    },

    // DD/MM/YYYY
    short(date, timeZone) {
      return datetimeFormat(date, { timeZone, dateStyle: 'short' });
    },

    // DD MMM
    daymonth(date, timeZone) {
      return datetimeFormat(date, { timeZone, day: 'numeric', month: 'short' });
    }

  }

};


// localised number function
export const number = {

  round(value, dp = 3) {

    const f = 10 ** dp;
    return Math.round(value * f) / f;

  },

  format(value, notation, round) {

    round = (typeof round === 'undefined' ? (value > 100 ? 0 : 2) : round);

    const opt = {
      minimumFractionDigits: round,
      maximumFractionDigits: round,
    };

    if (notation) opt.notation = notation;

    return Intl.NumberFormat(
      tezosReducer.locale || [], opt
    ).format( value );
  }

};


// localised currency function
export const currency = {

  format(value, currency) {
    return Intl.NumberFormat(
      tezosReducer.locale || [],
      { style: 'currency', currency, maximumFractionDigits: (value > 100 ? 0 : 2) }
    ).format( value );
  }

};


// localised percent function
export const percent = {

  format(value, round, sign) {

    round = (typeof round === 'undefined' ? (value > 100 ? 0 : 2) : round);
    const opt = {
      style: 'percent',
      minimumFractionDigits: round,
      maximumFractionDigits: round,
    };
    if (sign) opt.signDisplay = 'exceptZero';

    return Intl.NumberFormat(
      tezosReducer.locale || [], opt
    ).format( value );
  }

};


// DOM updater
// caches nodes and updates content if changed
export class DOM {

  #doc = null;  // document
  #dom = {};    // DOM cache

  // select document
  constructor(doc) {
    this.#doc = doc || window.document;
  }

  // reset DOM cache
  reset() {
    this.#dom = {};
  }

  // get first text node
  firstTextNode( node ) {
    return [...node.childNodes].find(child => child.nodeType === Node.TEXT_NODE) || node;
  }

  // update a selector with a value
  update( sel, value ) {

    // cached or new selector
    this.#dom[sel] = this.#dom[sel] || { select: sel };
    const d = this.#dom[sel];

    // select node
    if (typeof d.node === 'undefined') {
      d.node = this.#doc.querySelector( sel );
    }

    // update content
    if (d.node && value !== d.value) {
      d.value = value;
      this.firstTextNode(d.node).textContent = value;
      if (d.node.hasAttribute('value')) d.node.setAttribute('value', value);
    }

  }

}


// DOM utility functions
export const dom = {

  // remove all child elements
  clean(node) {
    while (node.lastChild) node.removeChild(node.lastChild);
  },

  // append elements in string or fragment to node
  add(node, block) {

    if (typeof block === 'undefined') return;

    // convert string to DOM elements
    if (typeof block === 'string') {

      const
        div = document.createElement('div'),
        frag = new DocumentFragment();

      div.innerHTML = block;
      while (div.childElementCount) {
        frag.appendChild(div.firstElementChild);
      }

      block = frag;

    }

    node.appendChild( block );
    return node.lastChild;

  }

};


// CSS utility functions
export const css = {

  // sets an active class and unsets any non-active
  setClass(node, active, nonActive = []) {

    nonActive.forEach( c => { if (c !== active) node.classList.remove(c); } );
    if (active) node.classList.add(active);

  }

};


// debounce event
export function debounce(fn, delay = 300) {

  let timer = null;
  return function() {
    clearTimeout(timer);
    timer = setTimeout( fn.bind(this, ...arguments), delay );
  };

}

// language translation
const languageToken = {

  '12-hour': {
    fr: '12-heures',
    de: '12-stunden',
    pt: '12 horas',
    es: '12 horas',
    it: '12 ore',
    sv: '12 timmar',
    ru: '12 часов',
    ar: '12 ساعة',
    zh: '12 小时',
    ja: '12時間',
  },

  accounts: {
    fr: 'comptes',
    de: 'konten',
    pt: 'contas',
    es: 'cuentas',
    it: 'conti',
    sv: 'konton',
    ru: 'учетные записи',
    ar: 'حسابات',
    zh: '帐户',
    ja: 'アカウント',
  },

  always: {
    fr: 'toujours',
    de: 'stets',
    pt: 'sempre',
    es: 'siempre',
    it: 'sempre',
    sv: 'alltid',
    ru: 'всегда',
    ar: 'دائماً',
    zh: '总是',
    ja: 'いつも',
  },

  average: {
    fr: 'moyen',
    de: 'durchschnitt',
    pt: 'média',
    es: 'promedio',
    it: 'media',
    sv: 'medel',
    ru: 'средний',
    ar: 'معدل',
    zh: '平均',
    ja: '平均',
  },

  awake: {
    fr: 'éveillé',
    de: 'erwachen',
    pt: 'acordado',
    es: 'despierto',
    it: 'sveglio',
    sv: 'vaken',
    ru: 'бодрствующий',
    ar: 'مستيقظ',
    zh: '苏醒',
    ja: '起きた',
  },

  bakers: {
    fr: 'boulangers',
    de: 'bäcker',
    pt: 'padeiros',
    es: 'panadería',
    it: 'fornai',
    sv: 'bagare',
    ru: 'пекари',
    ar: 'الخبازين',
    zh: '面包师',
    ja: 'パン職人',
  },

  block: {
    fr: 'bloquer',
    pt: 'quadra',
    es: 'bloquear',
    it: 'bloccare',
    sv: 'blockera',
    ru: 'блокировать',
    ar: 'الكتلة',
    zh: '堵塞',
    ja: 'ブロック',
  },

  change: {
    fr: 'monnaie',
    de: 'rückgeld',
    pt: 'mudança',
    es: 'cambio',
    it: 'modificare',
    sv: 'förändra',
    ru: 'сдача',
    ar: 'يتغيرون',
    zh: '改变',
    ja: '変化する',
  },

  chart: {
    fr: 'graphique',
    de: 'diagramm',
    pt: 'gráfico',
    es: 'cuadro',
    it: 'grafico',
    sv: 'diagram',
    ru: 'диаграмма',
    ar: 'جدول',
    zh: '图表',
    ja: 'チャート',
  },

  cleared: {
    fr: 'effacé',
    de: 'gelöscht',
    pt: 'limpo',
    es: 'despejado',
    it: 'cancellato',
    sv: 'rensas',
    ru: 'очищен',
    ar: 'مسح',
    zh: '清除',
    ja: 'クリア',
  },

  compact: {
    de: 'kompakt',
    pt: 'compactar',
    es: 'compacto',
    it: 'compatto',
    sv: 'kompakt',
    ru: 'компактный',
    ar: 'المدمج',
    zh: '袖珍的',
    ja: 'コンパクト',
  },

  compare: {
    fr: 'comparer',
    de: 'vergleichen',
    pt: 'comparar',
    es: 'comparar',
    it: 'confrontare',
    sv: 'jämföra',
    ru: 'сравнивать',
    ar: 'قارن',
    zh: '相比',
    ja: '比較',
  },

  crypto: {
    de: 'krypto',
    pt: 'cripto',
    es: 'cripro',
    it: 'cripro',
    sv: 'crypro',
    ru: 'крипро',
    ar: 'كريبرو',
    zh: '密码',
    ja: 'クリプロ',
  },

  currency: {
    fr: 'devise',
    de: 'währung',
    pt: 'moeda',
    es: 'divisa',
    it: 'moneta',
    sv: 'valuta',
    ru: 'валюта',
    ar: 'عملة',
    zh: '货币',
    ja: '通貨',
  },

  current: {
    fr: 'courant',
    de: 'aktuell',
    pt: 'atual',
    es: 'actual',
    it: 'attuale',
    sv: 'nuvarande',
    ru: 'текущий',
    ar: 'تيار',
    zh: '当前的',
    ja: '現在',
  },

  cycle: {
    de: 'kreislauf',
    pt: 'ciclo',
    es: 'ciclo',
    it: 'ciclo',
    sv: 'cykel',
    ru: 'цикл',
    ar: 'دورة',
    zh: '循环',
    ja: 'サイクル',
  },

  date: {
    de: 'datum',
    pt: 'encontro',
    es: 'fecha',
    it: 'data',
    sv: 'datum',
    ru: 'свидание',
    ar: 'تاريخ',
    zh: '日期',
    ja: '日にち',
  },

  day: {
    fr: 'journée',
    de: 'tag',
    pt: 'dia',
    es: 'día',
    it: 'giorno',
    sv: 'dag',
    ru: 'день',
    ar: 'يوم',
    zh: '天',
    ja: '日',
  },

  end: {
    fr: 'fin',
    de: 'ende',
    pt: 'fim',
    es: 'final',
    it: 'fine',
    sv: 'slutet',
    ru: 'конец',
    ar: 'نهاية',
    zh: '结尾',
    ja: '終わり',
  },

  format: {
    pt: 'formato',
    es: 'formato',
    it: 'formato',
    sv: 'formatera',
    ru: 'формат',
    ar: 'صيغة',
    zh: '格式',
    ja: 'フォーマット',
  },

  fullscreen: {
    fr: 'plein écran',
    de: 'ganzer bildschirm',
    pt: 'tela cheia',
    es: 'pantalla completa',
    it: 'a schermo intero',
    sv: 'fullskärm',
    ru: 'полноэкранный',
    ar: 'شاشة كاملة',
    zh: '全屏',
    ja: '全画面表示',
  },

  funded: {
    fr: 'financé',
    de: 'finanziert',
    pt: 'financiado',
    es: 'fundado',
    it: 'finanziato',
    sv: 'finansieras',
    ru: 'финансируемый',
    ar: 'ممول',
    zh: '资助的',
    ja: '資金提供',
  },

  install: {
    fr: 'installer',
    de: 'installieren',
    pt: 'instalar',
    es: 'instalar',
    it: 'installare',
    sv: 'installera',
    ru: 'установить',
    ar: 'تثبيت',
    zh: '安装',
    ja: 'インストール',
  },

  language: {
    fr: 'langue',
    de: 'sprache',
    pt: 'língua',
    es: 'idioma',
    it: 'linguaggio',
    sv: 'språk',
    ru: 'язык',
    ar: 'لغة',
    zh: '语',
    ja: '言語',
  },

  long: {
    de: 'lang',
    pt: 'grandes',
    es: 'largo',
    it: 'lungo',
    sv: 'lång',
    ru: 'длинная',
    ar: 'طويل',
    zh: '长',
    ja: '長いです',
  },

  maximum: {
    de: 'maximal',
    pt: 'máximo',
    es: 'máximo',
    it: 'massimo',
    sv: 'maximal',
    ru: 'максимум',
    ar: 'أقصى',
    zh: '最大',
    ja: '最大',
  },

  medium: {
    fr: 'moyen',
    de: 'mittel',
    pt: 'médio',
    es: 'medio',
    it: 'medio',
    ru: 'средний',
    ar: 'متوسط',
    zh: '中等的',
    ja: '中くらい',
  },

  minimum: {
    pt: 'mínimo',
    es: 'mínimo',
    it: 'minimo',
    ru: 'минимум',
    ar: 'الحد الأدنى',
    zh: '最低限度',
    ja: '最小',
  },

  month: {
    fr: 'mois',
    de: 'monat',
    pt: 'mês',
    es: 'mes',
    it: 'mese',
    sv: 'månad',
    ru: 'месяц',
    ar: 'شهر',
    zh: '月',
    ja: '月',
  },

  new: {
    fr: 'nouveau',
    de: 'neu',
    pt: 'novo',
    es: 'nuevo',
    it: 'nuovo',
    sv: 'ny',
    ru: 'новый',
    ar: 'الجديد',
    zh: '新的',
    ja: '新着',
  },

  none: {
    fr: 'rien',
    de: 'keiner',
    pt: 'Nenhum',
    es: 'ninguna',
    it: 'nessuno',
    sv: 'ingen',
    ru: 'никто',
    ar: 'لا أحد',
    zh: '没有任何',
    ja: 'なし',
  },

  'non-funded': {
    fr: 'non financé',
    de: 'nicht finanziert',
    pt: 'não financiado',
    es: 'no financiado',
    it: 'non finanziato',
    sv: 'icke-finansierat',
    ru: 'нефинансируемый',
    ar: 'غير ممولة',
    zh: '非资助',
    ja: '資金提供なし',
  },

  price: {
    fr: 'le prix',
    de: 'preis',
    pt: 'preço',
    es: 'precio',
    it: 'prezzo',
    sv: 'pris',
    ru: 'цена',
    ar: 'سعر',
    zh: '价格',
    ja: '価格',
  },

  progress: {
    fr: 'le progrès',
    de: 'fortschritt',
    pt: 'progresso',
    es: 'Progreso',
    it: 'progresso',
    sv: 'framsteg',
    ru: 'прогресс',
    ar: 'تقدم',
    zh: '进步',
    ja: '進捗',
  },

  scientific: {
    fr: 'scientifique',
    de: 'wissenschaftlich',
    pt: 'científico',
    es: 'científico',
    it: 'scientifico',
    sv: 'vetenskaplig',
    ru: 'научный',
    ar: 'علمي',
    zh: '科学的',
    ja: '科学的',
  },

  seconds: {
    de: 'sekunden',
    pt: 'segundos',
    es: 'segundos',
    it: 'secondi',
    sv: 'sekunder',
    ru: 'секунды',
    ar: 'ثواني',
    zh: '秒',
    ja: '秒',
  },

  short: {
    fr: 'court',
    de: 'kurz',
    pt: 'curto',
    es: 'corto',
    it: 'breve',
    sv: 'kort',
    ru: 'короткая',
    ar: 'قصيرة',
    zh: '短的',
    ja: '短い',
  },

  solve: {
    fr: 'résoudre',
    de: 'lösen',
    pt: 'resolver',
    es: 'resolver',
    it: 'risolvere',
    sv: 'lösa',
    ru: 'решать',
    ar: 'يحل',
    zh: '解决',
    ja: '解決する',
  },

  standard: {
    fr: 'la norme',
    pt: 'padrão',
    es: 'estándar',
    ru: 'стандартный',
    ar: 'اساسي',
    zh: '标准',
    ja: '標準',
  },

  start: {
    fr: 'début',
    de: 'anfang',
    pt: 'começar',
    es: 'comienzo',
    it: 'inizio',
    ru: 'Начало',
    ar: 'بداية',
    zh: '开始',
    ja: '始める',
  },

  system: {
    fr: 'système',
    pt: 'sistema',
    es: 'sistema',
    it: 'sistema',
    sv: 'systemet',
    ru: 'система',
    ar: 'النظام',
    zh: '系统',
    ja: 'システム',
  },

  time: {
    fr: 'temps',
    de: 'Zeit',
    pt: 'Tempo',
    es: 'tiempo',
    it: 'volta',
    sv: 'tid',
    ru: 'время',
    ar: 'زمن',
    zh: '时间',
    ja: '時間',
  },

  timezone: {
    fr: 'fuseau horaire',
    de: 'zeitzone',
    pt: 'fuso horário',
    es: 'zona horaria',
    it: 'fuso orario',
    sv: 'tidszon',
    ru: 'часовой пояс',
    ar: 'وحدة زمنية',
    zh: '时区',
    ja: 'タイムゾーン',
  },

  total: {
    de: 'gesamt',
    it: 'totale',
    ru: 'общий',
    ar: 'المجموع',
    zh: '全部的',
    ja: '合計',
  },

  warning: {
    fr: 'attention',
    de: 'warnung',
    pt: 'aviso',
    es: 'advertencia',
    it: 'avvertimento',
    sv: 'varning',
    ru: 'предупреждение',
    ar: 'تحذير',
    zh: '警告',
    ja: '警告',
  },

  year: {
    fr: 'an',
    de: 'jahr',
    pt: 'ano',
    es: 'año',
    it: 'anno',
    sv: 'år',
    ru: 'год',
    ar: 'عام',
    zh: '年',
    ja: '年',
  },

};


// return token language translation
export function lang(token) {

  if (!token) return '';
  const locale = (tezosReducer.locale || window?.navigator?.language || 'en').slice(0,2).toLowerCase();
  return languageToken?.[token]?.[locale] || token;

}
