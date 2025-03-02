import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MinimalQuizPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
			this.addRibbonIcon('dice', 'Greet', () => {
			new Notice('Hello, world!2');
		});

		this.addCommand({
			id: 'show-questions-modal',
			name: 'Start quiz on current file',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				new Notice('Yup worked');
				const content = editor.getValue();
				const qaMap = this.extractQuestionsAndAnswers(content);
				const entries = Array.from(qaMap.entries());
				if (entries.length > 0) {
					new QuestionsModal(this.app, entries).open();
				} else {
					new Notice('No questions found.');
				}
			} 
		});
	}
	extractQuestionsAndAnswers(content: string): Map<string, string> {
		const qaMap = new Map<string, string>();
		const regex = /(.*\?)\n([\s\S]*?)(?=\n\n|$)/g;
		let match;
	
		while ((match = regex.exec(content)) !== null) {
			const question = match[1].trim();
			const answer = match[2].trim();
			if (question && answer) {
				qaMap.set(question, answer);
			}
		}
	
		return qaMap;
	}

	onunload() {
		console.log('Unloading Plugin')
	}


	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class QuestionsModal extends Modal {
	entries: [string, string][];
	answerVisible = false;
	currentIndex = 0;

	constructor(app: App, questions: [string, string][]) {
		super(app);
		this.entries = questions;
	}

	onOpen() {
		//const {contentEl, modalEl} = this;
		this.render();
		this.modalEl.style.backdropFilter = 'blur(10px)';
		this.modalEl.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
		this.modalEl.style.color = 'white';
		this.modalEl.style.padding = '20px';
		this.modalEl.style.borderRadius = '8px';
		
		window.addEventListener('keydown', this.handleKeyDown)
	}

	handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === ' ' || event.key === 'Enter') {
			this.toggleAnswer();
			event.preventDefault();
		}
	};

	render() {
		const { contentEl } = this;
		contentEl.empty();

		const [question, answer] = this.entries[this.currentIndex];
		contentEl.createEl('h2', question);
		
		const answerEl = contentEl.createEl('p', { text: this.answerVisible ? answer : ''});
		answerEl.style.marginTop = '20px';

		const button = contentEl.createEl('button', { text: this.answerVisible ? 'Next Questions' : 'Show Answer'});
		button.style.marginTop = '20px';
		button.addEventListener('click', () => this.toggleAnswer());
	}

	toggleAnswer(){
		if (this.answerVisible){
			this.currentIndex++;
			this.answerVisible = false;
			this.render();
		}
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
		window.removeEventListener('keydown', this.handleKeyDown);
	}
}