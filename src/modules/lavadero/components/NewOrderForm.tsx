"use client";

import { useState, useEffect } from "react";
import { X, Search, Plus, Check } from "lucide-react";
import { tenantFetch } from "@/lib/tenant-fetch";
import { cn } from "@/lib/utils";

interface NewOrderFormProps {
  onClose: () => void;
  onCreated: () => void;
}

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

interface VehicleResult {
  id: string;
  plate: string;
  type: string;
  color?: string;
  brand?: string;
  customer: { id: string; name: string; phone: string };
}

type Step = "plate" | "vehicle" | "services" | "confirm";

export function NewOrderForm({ onClose, onCreated }: NewOrderFormProps) {
  const [step, setStep] = useState<Step>("plate");
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState<VehicleResult | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // New customer/vehicle fields
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newVehicleType, setNewVehicleType] = useState<"CAR" | "SUV" | "MOTORCYCLE">("CAR");
  const [newVehicleColor, setNewVehicleColor] = useState("");
  const [newVehicleBrand, setNewVehicleBrand] = useState("");

  useEffect(() => {
    tenantFetch("/api/lavadero/services?active=true")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setServices(json.data.map((s: { id: string; name: string; price: unknown; active: boolean }) => ({ ...s, price: Number(s.price) })));
      });
  }, []);

  const searchPlate = async () => {
    if (plate.length < 4) return;
    setLoading(true);
    setError("");
    try {
      const res = await tenantFetch(`/api/lavadero/vehicles?plate=${plate.toUpperCase()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setVehicle(json.data);
        setStep("services");
      } else {
        setStep("vehicle");
      }
    } catch {
      setError("Error buscando vehículo");
    } finally {
      setLoading(false);
    }
  };

  const createCustomerAndVehicle = async () => {
    if (!newCustomerName || !newCustomerPhone) {
      setError("Nombre y teléfono del cliente son requeridos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Create customer
      const custRes = await tenantFetch("/api/lavadero/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCustomerName, phone: newCustomerPhone }),
      });
      const custJson = await custRes.json();
      if (!custJson.success) throw new Error(custJson.error?.phone?.[0] || "Error creando cliente");

      // Create vehicle
      const vehRes = await tenantFetch("/api/lavadero/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate: plate.toUpperCase(),
          type: newVehicleType,
          color: newVehicleColor || undefined,
          brand: newVehicleBrand || undefined,
          customerId: custJson.data.id,
        }),
      });
      const vehJson = await vehRes.json();
      if (!vehJson.success) throw new Error("Error creando vehículo");

      setVehicle(vehJson.data);
      setStep("services");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectedTotal = services
    .filter((s) => selectedServiceIds.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const createOrder = async () => {
    if (!vehicle || selectedServiceIds.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await tenantFetch("/api/lavadero/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          customerId: vehicle.customer.id,
          serviceIds: selectedServiceIds,
          notes: notes || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error creando orden");
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-bold text-slate-900">Nueva Orden</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Step indicators */}
          <div className="flex gap-1">
            {(["plate", "vehicle", "services", "confirm"] as Step[]).map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= ["plate", "vehicle", "services", "confirm"].indexOf(step)
                    ? "bg-cyan-500"
                    : "bg-slate-200"
                )}
              />
            ))}
          </div>

          {/* Step: Search plate */}
          {step === "plate" && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Buscar por placa</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none uppercase"
                  onKeyDown={(e) => e.key === "Enter" && searchPlate()}
                />
                <button
                  onClick={searchPlate}
                  disabled={plate.length < 4 || loading}
                  className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step: New vehicle + customer */}
          {step === "vehicle" && (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                No se encontró la placa <strong>{plate}</strong>. Cree un nuevo cliente y vehículo.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del cliente*</label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono*</label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="3001234567"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de vehículo</label>
                <select
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value as "CAR" | "SUV" | "MOTORCYCLE")}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none"
                >
                  <option value="CAR">Carro</option>
                  <option value="SUV">SUV / Camioneta</option>
                  <option value="MOTORCYCLE">Moto</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={newVehicleBrand}
                    onChange={(e) => setNewVehicleBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                  <input
                    type="text"
                    value={newVehicleColor}
                    onChange={(e) => setNewVehicleColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep("plate")} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  Atrás
                </button>
                <button
                  onClick={createCustomerAndVehicle}
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Creando..." : "Crear y Continuar"}
                </button>
              </div>
            </div>
          )}

          {/* Step: Select services */}
          {step === "services" && vehicle && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm font-semibold text-slate-900">{vehicle.plate} - {vehicle.brand || vehicle.type}</p>
                <p className="text-xs text-slate-500">{vehicle.customer.name} - {vehicle.customer.phone}</p>
              </div>

              <label className="block text-sm font-medium text-slate-700">Seleccione servicios</label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                      selectedServiceIds.includes(s.id)
                        ? "bg-cyan-50 border border-cyan-300 text-cyan-800"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {selectedServiceIds.includes(s.id) ? <Check size={14} className="text-cyan-600" /> : <Plus size={14} />}
                      {s.name}
                    </span>
                    <span className="font-semibold">${s.price.toLocaleString("es-CO")}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-cyan-500 outline-none resize-none"
                />
              </div>

              {selectedServiceIds.length > 0 && (
                <div className="flex justify-between items-center bg-cyan-50 rounded-lg px-3 py-2">
                  <span className="text-sm text-cyan-700">Total</span>
                  <span className="text-lg font-bold text-cyan-800">${selectedTotal.toLocaleString("es-CO")}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep("plate")} className="px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  Atrás
                </button>
                <button
                  onClick={createOrder}
                  disabled={loading || selectedServiceIds.length === 0}
                  className="flex-1 py-2 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Creando..." : "Crear Orden"}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
