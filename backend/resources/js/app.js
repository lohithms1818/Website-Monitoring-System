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
		formatTime(isoString) {
			if (!isoString) return 'Never';
			const date = new Date(isoString);
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + date.toLocaleDateString() + ')';
		},
		getLatencyClass(ms) {
			if (ms === null || ms === undefined) return '';
			if (ms < 300) return 'latency-fast';
			if (ms < 1000) return 'latency-med';
			return 'latency-slow';
		},
	},
	template: `
		<div class="page-shell">
			<section class="hero-card">
				<p class="eyebrow">Website Uptime Monitoring</p>
				<h1>Track client websites and respond to outages fast.</h1>
				<p class="subtext">Choose a client email to view the websites they want monitored.</p>
			</section>

			<section class="panel">
				<label class="field-label" for="client-select">Client email</label>
				<div class="select-wrapper">
					<select id="client-select" v-model="selectedEmail" :disabled="loading">
						<option v-for="client in clients" :key="client.id" :value="client.email">{{ client.email }}</option>
					</select>
				</div>

				<div v-if="selectedWebsites.length" class="website-list">
					<p class="list-heading">Monitored Websites</p>
					<div class="grid-container">
						<div v-for="website in selectedWebsites" :key="website.id" class="website-row">
							<!-- URL -->
							<a href="#" class="website-url" @click.prevent="openWebsite(website.url)">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;">
									<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
									<polyline points="15 3 21 3 21 9"></polyline>
									<line x1="10" y1="14" x2="21" y2="3"></line>
								</svg>
								{{ website.url }}
							</a>

							<!-- Status Badge -->
							<div>
								<span :class="['badge', 'badge-' + website.status]">
									<span class="badge-dot"></span>
									{{ website.status === 'up' ? 'Online' : website.status === 'down' ? 'Offline' : 'Pending' }}
								</span>
							</div>

							<!-- Latency -->
							<div class="latency-info">
								<span v-if="website.latency_ms !== null">
									Response: <span :class="['latency-value', getLatencyClass(website.latency_ms)]">{{ website.latency_ms }} ms</span>
								</span>
								<span v-else class="latency-value" style="color: var(--text-muted);">-- ms</span>
							</div>

							<!-- Last Checked Timestamp -->
							<div class="timestamp">
								Checked: {{ formatTime(website.last_checked_at) }}
							</div>

							<!-- Error Details (Only visible if down and error is present) -->
							<div v-if="website.status === 'down' && website.last_error" class="error-row">
								<strong>Outage Detail:</strong> {{ website.last_error }}
							</div>
						</div>
					</div>
				</div>
				<div v-else-if="!loading" class="empty-state">
					No websites monitored for this client.
				</div>
			</section>

			<!-- Confirm Dialog Modal -->
			<div v-if="modalOpen" class="modal-backdrop" @click="closeModal">
				<div class="modal-card" @click.stop>
					<h3 class="modal-title">Confirm Navigation</h3>
					<div class="modal-body">
						You are about to visit {{ pendingUrl }}. Do you want to continue?
					</div>
					<div class="modal-actions">
						<button class="secondary" @click="closeModal">Cancel</button>
						<button class="primary" @click="continueToWebsite">Continue</button>
					</div>
				</div>
			</div>
		</div>
	`,
});

app.mount('#app');
