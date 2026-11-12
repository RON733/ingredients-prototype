import { createApp } from 'vue';
import { createPinia } from 'pinia';
import AdminApp from './admin/AdminApp.vue';
import './assets/main.css';

// Admin Components
import AdminDashboard from './admin/AdminDashboard.vue';
import AdminOrdersTab from './admin/AdminOrdersTab.vue';
import AdminAnalyticsTab from './admin/AdminAnalyticsTab.vue';
import AdminCompletedTab from './admin/AdminCompletedTab.vue';
import AdminProductsTab from './admin/AdminProductsTab.vue';
import AdminInventoryTab from './admin/AdminInventoryTab.vue';
import AdminRecipesTab from './admin/AdminRecipesTab.vue';
import AdminBookingsTab from './admin/AdminBookingsTab.vue';
import AdminAnnouncementsTab from './admin/AdminAnnouncementsTab.vue';
import AdminUsersTab from './admin/AdminUsersTab.vue';
import AdminAuditTab from './admin/AdminAuditTab.vue';
import AdminSettingsTab from './admin/AdminSettingsTab.vue';
import StaffPinModal from './components/StaffPinModal.vue';
import AnnouncementModal from './components/AnnouncementModal.vue';
import ProductImageModal from './components/ProductImageModal.vue';
import DriverView from './components/DriverView.vue';
import DeliveryFleetView from './components/DeliveryFleetView.vue';
import AppDialog from './components/AppDialog.vue';

const app = createApp(AdminApp);
const pinia = createPinia();
app.use(pinia);

app.component('AdminDashboard', AdminDashboard);
app.component('DriverView', DriverView);
app.component('DeliveryFleetView', DeliveryFleetView);
app.component('AdminOrdersTab', AdminOrdersTab);
app.component('AdminAnalyticsTab', AdminAnalyticsTab);
app.component('AdminCompletedTab', AdminCompletedTab);
app.component('AdminProductsTab', AdminProductsTab);
app.component('AdminInventoryTab', AdminInventoryTab);
app.component('AdminRecipesTab', AdminRecipesTab);
app.component('AdminBookingsTab', AdminBookingsTab);
app.component('AdminAnnouncementsTab', AdminAnnouncementsTab);
app.component('AdminUsersTab', AdminUsersTab);
app.component('AdminAuditTab', AdminAuditTab);
app.component('AdminSettingsTab', AdminSettingsTab);
app.component('StaffPinModal', StaffPinModal);
app.component('AnnouncementModal', AnnouncementModal);
app.component('ProductImageModal', ProductImageModal);
app.component('AppDialog', AppDialog);

app.mount('#app');
