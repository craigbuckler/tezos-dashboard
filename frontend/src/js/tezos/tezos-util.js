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
    return [...node.childNodes].find(child => child.nodeType === Node.TEXT_NODE) || {};
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
    se: '12 timmar',
    ru: '12 часов',
    sa: '12 ساعة',
    cn: '12 小时',
    jp: '12時間',
  },

  accounts: {
    fr: 'comptes',
    de: 'konten',
    pt: 'contas',
    es: 'cuentas',
    it: 'conti',
    se: 'konton',
    ru: 'учетные записи',
    sa: 'حسابات',
    cn: '帐户',
    jp: 'アカウント',
  },

  average: {
    fr: 'moyen',
    de: 'durchschnitt',
    pt: 'média',
    es: 'promedio',
    it: 'media',
    se: 'medel',
    ru: 'средний',
    sa: 'معدل',
    cn: '平均',
    jp: '平均',
  },

  bakers: {
    fr: 'boulangers',
    de: 'bäcker',
    pt: 'padeiros',
    es: 'panadería',
    it: 'fornai',
    se: 'bagare',
    ru: 'пекари',
    sa: 'الخبازين',
    cn: '面包师',
    jp: 'パン職人',
  },

  block: {
    fr: 'bloquer',
    pt: 'quadra',
    es: 'bloquear',
    it: 'bloccare',
    se: 'blockera',
    ru: 'блокировать',
    sa: 'الكتلة',
    cn: '堵塞',
    jp: 'ブロック',
  },

  change: {
    fr: 'monnaie',
    de: 'rückgeld',
    pt: 'mudança',
    es: 'cambio',
    it: 'modificare',
    se: 'förändra',
    ru: 'сдача',
    sa: 'يتغيرون',
    cn: '改变',
    jp: '変化する',
  },

  chart: {
    fr: 'graphique',
    de: 'diagramm',
    pt: 'gráfico',
    es: 'cuadro',
    it: 'grafico',
    se: 'diagram',
    ru: 'диаграмма',
    sa: 'جدول',
    cn: '图表',
    jp: 'チャート',
  },

  cleared: {
    fr: 'effacé',
    de: 'gelöscht',
    pt: 'limpo',
    es: 'despejado',
    it: 'cancellato',
    se: 'rensas',
    ru: 'очищен',
    sa: 'مسح',
    cn: '清除',
    jp: 'クリア',
  },

  compact: {
    de: 'kompakt',
    pt: 'compactar',
    es: 'compacto',
    it: 'compatto',
    se: 'kompakt',
    ru: 'компактный',
    sa: 'المدمج',
    cn: '袖珍的',
    jp: 'コンパクト',
  },

  compare: {
    fr: 'comparer',
    de: 'vergleichen',
    pt: 'comparar',
    es: 'comparar',
    it: 'confrontare',
    se: 'jämföra',
    ru: 'сравнивать',
    sa: 'قارن',
    cn: '相比',
    jp: '比較',
  },

  crypto: {
    de: 'krypto',
    pt: 'cripto',
    es: 'cripro',
    it: 'cripro',
    se: 'crypro',
    ru: 'крипро',
    sa: 'كريبرو',
    cn: '密码',
    jp: 'クリプロ',
  },

  currency: {
    fr: 'devise',
    de: 'währung',
    pt: 'moeda',
    es: 'divisa',
    it: 'moneta',
    se: 'valuta',
    ru: 'валюта',
    sa: 'عملة',
    cn: '货币',
    jp: '通貨',
  },

  cycle: {
    de: 'kreislauf',
    pt: 'ciclo',
    es: 'ciclo',
    it: 'ciclo',
    se: 'cykel',
    ru: 'цикл',
    sa: 'دورة',
    cn: '循环',
    jp: 'サイクル',
  },

  date: {
    de: 'datum',
    pt: 'encontro',
    es: 'fecha',
    it: 'data',
    se: 'datum',
    ru: 'свидание',
    sa: 'تاريخ',
    cn: '日期',
    jp: '日にち',
  },

  day: {
    fr: 'journée',
    de: 'tag',
    pt: 'dia',
    es: 'día',
    it: 'giorno',
    se: 'dag',
    ru: 'день',
    sa: 'يوم',
    cn: '天',
    jp: '日',
  },

  end: {
    fr: 'fin',
    de: 'ende',
    pt: 'fim',
    es: 'final',
    it: 'fine',
    se: 'slutet',
    ru: 'конец',
    sa: 'نهاية',
    cn: '结尾',
    jp: '終わり',
  },

  format: {
    pt: 'formato',
    es: 'formato',
    it: 'formato',
    se: 'formatera',
    ru: 'формат',
    sa: 'صيغة',
    cn: '格式',
    jp: 'フォーマット',
  },

  funded: {
    fr: 'financé',
    de: 'finanziert',
    pt: 'financiado',
    es: 'fundado',
    it: 'finanziato',
    se: 'finansieras',
    ru: 'финансируемый',
    sa: 'ممول',
    cn: '资助的',
    jp: '資金提供',
  },

  long: {
    de: 'lang',
    pt: 'grandes',
    es: 'largo',
    it: 'lungo',
    se: 'lång',
    ru: 'длинная',
    sa: 'طويل',
    cn: '长',
    jp: '長いです',
  },

  maximum: {
    de: 'maximal',
    pt: 'máximo',
    es: 'máximo',
    it: 'massimo',
    se: 'maximal',
    ru: 'максимум',
    sa: 'أقصى',
    cn: '最大',
    jp: '最大',
  },

  medium: {
    fr: 'moyen',
    de: 'mittel',
    pt: 'médio',
    es: 'medio',
    it: 'medio',
    ru: 'средний',
    sa: 'متوسط',
    cn: '中等的',
    jp: '中くらい',
  },

  minimum: {
    pt: 'mínimo',
    es: 'mínimo',
    it: 'minimo',
    ru: 'минимум',
    sa: 'الحد الأدنى',
    cn: '最低限度',
    jp: '最小',
  },

  month: {
    fr: 'mois',
    de: 'monat',
    pt: 'mês',
    es: 'mes',
    it: 'mese',
    se: 'månad',
    ru: 'месяц',
    sa: 'شهر',
    cn: '月',
    jp: '月',
  },

  new: {
    fr: 'nouveau',
    de: 'neu',
    pt: 'novo',
    es: 'nuevo',
    it: 'nuovo',
    se: 'ny',
    ru: 'новый',
    sa: 'الجديد',
    cn: '新的',
    jp: '新着',
  },

  none: {
    fr: 'rien',
    de: 'keiner',
    pt: 'Nenhum',
    es: 'ninguna',
    it: 'nessuno',
    se: 'ingen',
    ru: 'никто',
    sa: 'لا أحد',
    cn: '没有任何',
    jp: 'なし',
  },

  'non-funded': {
    fr: 'non financé',
    de: 'nicht finanziert',
    pt: 'não financiado',
    es: 'no financiado',
    it: 'non finanziato',
    se: 'icke-finansierat',
    ru: 'нефинансируемый',
    sa: 'غير ممولة',
    cn: '非资助',
    jp: '資金提供なし',
  },

  progress: {
    fr: 'le progrès',
    de: 'fortschritt',
    pt: 'progresso',
    es: 'Progreso',
    it: 'progresso',
    se: 'framsteg',
    ru: 'прогресс',
    sa: 'تقدم',
    cn: '进步',
    jp: '進捗',
  },

  scientific: {
    fr: 'scientifique',
    de: 'wissenschaftlich',
    pt: 'científico',
    es: 'científico',
    it: 'scientifico',
    se: 'vetenskaplig',
    ru: 'научный',
    sa: 'علمي',
    cn: '科学的',
    jp: '科学的',
  },

  seconds: {
    de: 'sekunden',
    pt: 'segundos',
    es: 'segundos',
    it: 'secondi',
    se: 'sekunder',
    ru: 'секунды',
    sa: 'ثواني',
    cn: '秒',
    jp: '秒',
  },

  short: {
    fr: 'court',
    de: 'kurz',
    pt: 'curto',
    es: 'corto',
    it: 'breve',
    se: 'kort',
    ru: 'короткая',
    sa: 'قصيرة',
    cn: '短的',
    jp: '短い',
  },

  solve: {
    fr: 'résoudre',
    de: 'lösen',
    pt: 'resolver',
    es: 'resolver',
    it: 'risolvere',
    se: 'lösa',
    ru: 'решать',
    sa: 'يحل',
    cn: '解决',
    jp: '解決する',
  },

  standard: {
    fr: 'la norme',
    pt: 'padrão',
    es: 'estándar',
    ru: 'стандартный',
    sa: 'اساسي',
    cn: '标准',
    jp: '標準',
  },

  start: {
    fr: 'début',
    de: 'anfang',
    pt: 'começar',
    es: 'comienzo',
    it: 'inizio',
    ru: 'Начало',
    sa: 'بداية',
    cn: '开始',
    jp: '始める',
  },

  timezone: {
    fr: 'fuseau horaire',
    de: 'zeitzone',
    pt: 'fuso horário',
    es: 'zona horaria',
    it: 'fuso orario',
    se: 'tidszon',
    ru: 'часовой пояс',
    sa: 'وحدة زمنية',
    cn: '时区',
    jp: 'タイムゾーン',
  },

  total: {
    de: 'gesamt',
    it: 'totale',
    ru: 'общий',
    sa: 'المجموع',
    cn: '全部的',
    jp: '合計',
  },

  warning: {
    fr: 'attention',
    de: 'warnung',
    pt: 'aviso',
    es: 'advertencia',
    it: 'avvertimento',
    se: 'varning',
    ru: 'предупреждение',
    sa: 'تحذير',
    cn: '警告',
    jp: '警告',
  },

  year: {
    fr: 'an',
    de: 'jahr',
    pt: 'ano',
    es: 'año',
    it: 'anno',
    se: 'år',
    ru: 'год',
    sa: 'عام',
    cn: '年',
    jp: '年',
  },

};


// return token language translation
export function lang(token) {

  const locale = (tezosReducer.locale || window?.navigator?.language || 'en').slice(0,2).toLowerCase();
  return languageToken?.[token]?.[locale] || token;

}
