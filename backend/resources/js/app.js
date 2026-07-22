import { createApp, ref } from 'vue';
import axios from 'axios';

window.axios = axios;

const app = createApp({
	data() {
		return {
			clients: [],
			selectedEmail: '',
			modalOpen: false,
			pendingUrl: '',
			loading: true,
		};
	},
	computed: {
		selectedClient() {
			return this.clients.find((client) => client.email === this.selectedEmail) || null;
		},
		selectedWebsites() {
			return this.selectedClient ? this.selectedClient.websites : [];
		},
	},
	mounted() {
		this.loadClients();
	},
	methods: {
		async loadClients() {
			this.loading = true;
			try {
				const response = await axios.get('/api/clients');
				this.clients = response.data;
				if (!this.selectedEmail && this.clients.length) {
					this.selectedEmail = this.clients[0].email;
				}
				this.loading = false;
			} catch (error) {
				console.error('Error loading clients:', error);
				this.loading = false;
			}
		},
		openWebsite(url) {
			this.pendingUrl = url;
			this.modalOpen = true;
		},
		continueToWebsite() {
			window.open(this.pendingUrl, '_blank', 'noopener,noreferrer');
			this.modalOpen = false;
			this.pendingUrl = '';
		},
		closeModal() {
			this.modalOpen = false;
			this.pendingUrl = '';
		},
	},
	template: `<div class="page-shell"><section class="hero-card"><p class="eyebrow">Website uptime monitoring</p><h1>Track client websites and respond to outages fast.</h1><p class="subtext">Choose a client email to view the websites they want monitored.</p></section><section class="panel"><label class="field-label" for="client-select">Client email</label><select id="client-select" v-model="selectedEmail" :disabled="loading"><option v-for="client in clients" :key="client.id" :value="client.email">{{ client.email }}</option></select><div v-if="selectedWebsites.length" class="website-list"><p class="list-heading">Monitored websites</p><ul><li v-for="website in selectedWebsites" :key="website.id"><a href="#" @click.prevent="openWebsite(website.url)">{{ website.url }}</a></li></ul></div><div v-else-if="!loading" class="empty-state">No websites monitored for this client.</div></section><div v-if="modalOpen" class="modal-backdrop" @click="closeModal"><div class="modal-card" @click.stop><p>You are about to visit {{ pendingUrl }}. Do you want to continue?</p><div class="modal-actions"><button class="secondary" @click="closeModal">Cancel</button><button @click="continueToWebsite">Continue</button></div></div></div></div>`,
});

app.mount('#app');
