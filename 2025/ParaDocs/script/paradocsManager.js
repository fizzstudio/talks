import docList from './doclist.js';

export default class ParaDocs {
  constructor() {
    // constants
    this.svgns = 'http://www.w3.org/2000/svg';
    this.xlinkns = 'http://www.w3.org/1999/xlink';
    this.root = document.documentElement;

    this.showAllDocs = false;

    this.docList = docList;
    this.currentDocIndex = null;

    this.steps = [];
    this.currentStepIndex = 0;
    this.previousStep = null;
    this.nextStep = null;

    console.log('OK', this.docList)


    if (this.docList) {
      this.init();
    }
  }

  init() {
    console.log('docs', this.docList)

    this.root.addEventListener('click', this.activate.bind(this), false);
    this.root.addEventListener('keydown', this.handleKeys.bind(this), false);

    this.getDocInfo();
    this.findSteps();
  }

  findSteps() {
    const stepElements = document.querySelectorAll('[data-step], [data-draw], [data-fade]');

    for (const element of stepElements) {
      this.steps.push({
        node: element,
        step: +element.dataset.step,
        isHide: element.dataset.hide === 'hide' ? true : false,
      });
    }

    console.log('steps', this.steps)
  }

  loadPrefs() {
    let prefs = window.location.search;
    if (prefs && prefs.includes('show_all=true')) {
      this.showAllDocs = true;
    }
  }

  getDocInfo() {
    const parsedUrl = new URL(window.location.href);
    console.log('parsedUrl', parsedUrl);
    const docName = parsedUrl.pathname.substring(1);
    // console.log(parsedUrl.searchParams.get("id")); // "123"
    this.currentDocIndex = this.docList.indexOf(docName);

    console.log('docName', docName, this.currentDocIndex);

  }

  activate(event) {
  }

  handleKeys(event) {
    const key = event.key;
    if (key.startsWith('Arrow')) {
      console.warn('key', key)

    } else {
      console.log('key', key)
    }
  }
}