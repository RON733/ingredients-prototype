import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/main.css';

// Global Customer Components
import Navbar from './components/Navbar.vue';
import LandingHero from './components/LandingHero.vue';
import AnnouncementSection from './components/AnnouncementSection.vue';
import FeaturedSection from './components/FeaturedSection.vue';
import MenuSection from './components/MenuSection.vue';
import CustomizationModal from './components/CustomizationModal.vue';
import ProductImageModal from './components/ProductImageModal.vue';
import CartDrawer from './components/CartDrawer.vue';
import CheckoutView from './components/CheckoutView.vue';
import OrderTracker from './components/OrderTracker.vue';
import OrderHistoryView from './components/OrderHistoryView.vue';
import BookingHistoryList from './components/BookingHistoryList.vue';
import BookingHistoryView from './components/BookingHistoryView.vue';
import ActiveOrderWidget from './components/ActiveOrderWidget.vue';
import ChatbotAssistant from './components/ChatbotAssistant.vue';
import EventBookingModal from './components/EventBookingModal.vue';
import AnnouncementModal from './components/AnnouncementModal.vue';
import AuthModal from './components/AuthModal.vue';
import StaffPinModal from './components/StaffPinModal.vue';
import AboutSection from './components/AboutSection.vue';
import DriverView from './components/DriverView.vue';
import DeliveryFleetView from './components/DeliveryFleetView.vue';
import ContactSection from './components/ContactSection.vue';
import MaintenanceView from './components/MaintenanceView.vue';

// Admin Components (for quick admin views)
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

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Register Global Components
app.component('Navbar', Navbar);
app.component('LandingHero', LandingHero);
app.component('AnnouncementSection', AnnouncementSection);
app.component('FeaturedSection', FeaturedSection);
app.component('MenuSection', MenuSection);
app.component('CustomizationModal', CustomizationModal);
app.component('ProductImageModal', ProductImageModal);
app.component('CartDrawer', CartDrawer);
app.component('CheckoutView', CheckoutView);
app.component('OrderTracker', OrderTracker);
app.component('OrderHistoryView', OrderHistoryView);
app.component('BookingHistoryList', BookingHistoryList);
app.component('BookingHistoryView', BookingHistoryView);
app.component('ActiveOrderWidget', ActiveOrderWidget);
app.component('ChatbotAssistant', ChatbotAssistant);
app.component('EventBookingModal', EventBookingModal);
app.component('AnnouncementModal', AnnouncementModal);
app.component('AuthModal', AuthModal);
app.component('StaffPinModal', StaffPinModal);
app.component('AboutSection', AboutSection);
app.component('DriverView', DriverView);
app.component('DeliveryFleetView', DeliveryFleetView);
app.component('ContactSection', ContactSection);
app.component('MaintenanceView', MaintenanceView);

app.component('AdminDashboard', AdminDashboard);
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

app.mount('#app');
