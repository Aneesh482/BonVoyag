import axios from 'axios';
import type {
  Vessel,
  Port,
  CargoEnquiry,
  VesselEnquiry,
  Voyage,
  VoyageEstimate,
  FreightForecast,
  MarketData,
  CharterRecommendation,
  VesselRecommendation,
  DashboardSummary,
  Alert,
  Certificate,
  CalendarEvent,
  MarketplaceItem,
  Route,
} from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with defaults
const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    throw error;
  }
);

class ApiClient {
  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const { data } = await axiosClient.get('/api/dashboard/summary');
    return data;
  }

  // Vessels
  async getVessels(params?: Record<string, any>): Promise<Vessel[]> {
    const { data } = await axiosClient.get('/api/vessels', { params });
    return data;
  }

  async getVessel(id: string): Promise<Vessel> {
    const { data } = await axiosClient.get(`/api/vessels/${id}`);
    return data;
  }

  async getVesselPositions(): Promise<Vessel[]> {
    const { data } = await axiosClient.get('/api/vessels/positions');
    return data;
  }

  // Cargo Enquiries (shipments)
  async getCargoEnquiries(params?: Record<string, any>): Promise<CargoEnquiry[]> {
    const { data } = await axiosClient.get('/api/shipments', { params });
    return data;
  }

  async getCargoEnquiry(id: string): Promise<CargoEnquiry> {
    const { data } = await axiosClient.get(`/api/shipments/${id}`);
    return data;
  }

  async createCargoEnquiry(payload: Partial<CargoEnquiry>): Promise<CargoEnquiry> {
    const { data } = await axiosClient.post('/api/shipments', payload);
    return data;
  }

  async updateCargoEnquiry(id: string, payload: Partial<CargoEnquiry>): Promise<CargoEnquiry> {
    const { data } = await axiosClient.patch(`/api/shipments/${id}`, payload);
    return data;
  }

  // Vessel Enquiries
  async getVesselEnquiries(params?: Record<string, any>): Promise<VesselEnquiry[]> {
    const { data } = await axiosClient.get('/api/vessels', { params });
    // Map vessel data to enquiry format
    return data.map((v: any) => ({
      id: v.id,
      vesselId: v.id,
      vesselName: v.name,
      vesselType: v.type,
      dwt: v.dwt,
      openDate: new Date().toISOString(),
      openPort: 'Open',
      ownerBroker: 'Direct Owner',
      fuelConsumption: v.fuelConsumption,
      status: v.status === 'Available' ? 'Open' : v.status,
      source: 'Database',
      createdAt: new Date().toISOString(),
    }));
  }

  async createVesselEnquiry(payload: Partial<VesselEnquiry>): Promise<VesselEnquiry> {
    const { data } = await axiosClient.post('/api/vessels', payload);
    return data;
  }

  // Ports
  async getPorts(): Promise<Port[]> {
    const { data } = await axiosClient.get('/api/ports');
    return data;
  }

  async getPort(id: string): Promise<Port> {
    const { data } = await axiosClient.get(`/api/ports/${id}`);
    return data;
  }

  // Voyage
  async calculateDistance(origin: string, destination: string, vesselType?: string): Promise<Route> {
    const { data } = await axiosClient.post('/api/forecast/routes', {
      origin,
      destination,
      vesselType,
    });
    return data;
  }

  async estimateVoyage(payload: any): Promise<VoyageEstimate> {
    const { data } = await axiosClient.post('/api/forecast', payload);
    return data;
  }

  // Forecast
  async getFreightForecast(params: {
    commodity: string;
    origin: string;
    destination: string;
    vesselType: string;
    horizon: string;
  }): Promise<any> {
    const { data } = await axiosClient.post('/api/forecast', params);
    return data;
  }

  // Market
  async getMarketData(): Promise<MarketData> {
    const { data } = await axiosClient.get('/api/market');
    return data;
  }

  // Optimization
  async getCharterRecommendation(shipmentId: string, params?: any): Promise<any> {
    const { data } = await axiosClient.post('/api/optimization/charter', {
      shipmentId: Number(shipmentId),
      ...params,
    });
    return data;
  }

  async getOptimizationResults(): Promise<any[]> {
    const { data } = await axiosClient.get('/api/optimization/results');
    return data;
  }

  async getOptimizationResult(shipmentId: string): Promise<any> {
    const { data } = await axiosClient.get(`/api/optimization/results/${shipmentId}`);
    return data;
  }

  async getVesselRecommendations(cargoId: string): Promise<VesselRecommendation> {
    const { data } = await axiosClient.post('/api/optimization/charter', {
      shipmentId: Number(cargoId),
    });
    return data;
  }

  // Alerts (derived from optimization results)
  async getAlerts(): Promise<Alert[]> {
    try {
      const results = await this.getOptimizationResults();
      return results.slice(0, 5).map((r: any, idx: number) => ({
        id: `al${idx + 1}`,
        type: 'charter_opportunity' as const,
        severity: r.riskScore > 0.7 ? 'critical' : r.riskScore > 0.4 ? 'warning' : 'info' as const,
        title: `Optimization: ${r.originPort} → ${r.destinationPort}`,
        message: r.recommendationReason || `Total cost: $${r.totalCost?.toLocaleString()}`,
        relatedEntityId: String(r.shipmentId),
        relatedEntityType: 'cargo',
        actionRequired: true,
        read: false,
        createdAt: r.createdAt || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }

  async markAlertRead(id: string): Promise<void> {
    // No-op for now
  }

  // Certificates (placeholder - not in DB schema)
  async getCertificates(vesselId?: string): Promise<Certificate[]> {
    return [];
  }

  // Calendar (derived from shipments)
  async getCalendarEvents(start: string, end: string): Promise<CalendarEvent[]> {
    try {
      const shipments = await this.getCargoEnquiries();
      return shipments.map((s: any) => ({
        id: `ev${s.id}`,
        type: 'laycan' as const,
        title: `${s.cargoType} - ${s.origin} → ${s.destination}`,
        startDate: s.laycanStart,
        endDate: s.laycanEnd,
        cargoId: s.id,
        location: s.origin,
        description: `${s.quantity?.toLocaleString()} MT`,
      }));
    } catch {
      return [];
    }
  }

  // Marketplace (derived from vessels and shipments)
  async getMarketplaceItems(type?: string): Promise<MarketplaceItem[]> {
    try {
      const [vessels, shipments] = await Promise.all([
        this.getVessels(),
        this.getCargoEnquiries(),
      ]);

      const items: MarketplaceItem[] = [];

      if (!type || type === 'vessel') {
        for (const v of vessels.slice(0, 5)) {
          items.push({
            id: `mp-v-${v.id}`,
            type: 'vessel',
            title: `${v.type} - ${v.name}`,
            description: `${v.name}, ${v.dwt?.toLocaleString()} DWT`,
            dwt: v.dwt,
            date: new Date().toISOString(),
            status: v.status || 'Available',
            postedBy: 'Database',
            postedAt: new Date().toISOString(),
          });
        }
      }

      if (!type || type === 'cargo') {
        for (const s of shipments.slice(0, 5)) {
          items.push({
            id: `mp-c-${s.id}`,
            type: 'cargo',
            title: `${s.cargoType} ${s.origin} → ${s.destination}`,
            description: `${s.quantity?.toLocaleString()} MT`,
            origin: s.origin,
            destination: s.destination,
            quantity: s.quantity,
            date: s.laycanStart || new Date().toISOString(),
            status: s.status || 'Open',
            postedBy: 'Database',
            postedAt: new Date().toISOString(),
          });
        }
      }

      return items;
    } catch {
      return [];
    }
  }

  // Weather
  async getWeather(portId?: string): Promise<any[]> {
    const { data } = await axiosClient.get('/api/weather', {
      params: portId ? { portId } : {},
    });
    return data;
  }

  // Routes
  async getRoutes(): Promise<any[]> {
    const { data } = await axiosClient.get('/api/forecast/routes');
    return data;
  }
}

export const api = new ApiClient();
