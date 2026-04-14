"use client";

import { useEffect, useState } from "react";
import { useData } from "@/context/data-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Truck, Save, RotateCcw } from "lucide-react";
import type { DeliverySettings } from "@/lib/types";

const DEFAULT_SETTINGS = {
  feeTalatona: 2000,
  feeOutsideTalatona: 2500,
  feeOutsideZones: 4000,
  exemptionTalatona: 70000,
  exemptionOutsideTalatona: 80000,
};

export function DeliverySettingsPanel() {
  const { deliverySettings, getDeliverySettings, updateDeliverySettings, loading } = useData();
  const [formData, setFormData] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    getDeliverySettings();
  }, [getDeliverySettings]);

  useEffect(() => {
    if (deliverySettings) {
      setFormData({
        feeTalatona: deliverySettings.feeTalatona ?? DEFAULT_SETTINGS.feeTalatona,
        feeOutsideTalatona: deliverySettings.feeOutsideTalatona ?? DEFAULT_SETTINGS.feeOutsideTalatona,
        feeOutsideZones: deliverySettings.feeOutsideZones ?? DEFAULT_SETTINGS.feeOutsideZones,
        exemptionTalatona: deliverySettings.exemptionTalatona ?? DEFAULT_SETTINGS.exemptionTalatona,
        exemptionOutsideTalatona: deliverySettings.exemptionOutsideTalatona ?? DEFAULT_SETTINGS.exemptionOutsideTalatona,
      });
    }
  }, [deliverySettings]);

  const handleSave = async () => {
    await updateDeliverySettings({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleReset = () => {
    setFormData(DEFAULT_SETTINGS);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-PT') + ' Kz';
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <CardTitle>Configurações de Entrega</CardTitle>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-1" />
            {loading ? "A guardar..." : "Guardar"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Delivery Fees */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Taxas de Entrega
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="feeTalatona">
                Talatona/Morro Bento
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="feeTalatona"
                  type="number"
                  value={formData.feeTalatona}
                  onChange={(e) => setFormData(prev => ({ ...prev, feeTalatona: parseInt(e.target.value) || 0 }))}
                  className="w-32"
                />
                <span className="text-muted-foreground">Kz</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Taxa aplicada para entregas em Talatona e Morro Bento
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeOutsideTalatona">
                Fora de Talatona (Centro/Nova Vida/Patriota)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="feeOutsideTalatona"
                  type="number"
                  value={formData.feeOutsideTalatona}
                  onChange={(e) => setFormData(prev => ({ ...prev, feeOutsideTalatona: parseInt(e.target.value) || 0 }))}
                  className="w-32"
                />
                <span className="text-muted-foreground">Kz</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Taxa aplicada para entregas fora de Talatona
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeOutsideZones">
                Fora das Zonas (Viana/Kilamba/Jardim de Rosas)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="feeOutsideZones"
                  type="number"
                  value={formData.feeOutsideZones}
                  onChange={(e) => setFormData(prev => ({ ...prev, feeOutsideZones: parseInt(e.target.value) || 0 }))}
                  className="w-32"
                />
                <span className="text-muted-foreground">Kz</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Taxa aplicada para entregas em Viana, Kilamba e zonas adjacentes
              </p>
            </div>
          </div>

          {/* Exemption Thresholds */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Valores de Isenção (Entrega Gratuita)
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="exemptionTalatona">
                Isenção - Talatona/Morro Bento
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="exemptionTalatona"
                  type="number"
                  value={formData.exemptionTalatona}
                  onChange={(e) => setFormData(prev => ({ ...prev, exemptionTalatona: parseInt(e.target.value) || 0 }))}
                  className="w-32"
                />
                <span className="text-muted-foreground">Kz</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Encomendas acima deste valor têm entrega gratuita em Talatona/Morro Bento.
                Use 0 para desativar isenção.
              </p>
              <p className="text-sm font-medium text-green-600">
                Entrega gratuita acima de {formatCurrency(formData.exemptionTalatona)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exemptionOutsideTalatona">
                Isenção - Fora de Talatona
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="exemptionOutsideTalatona"
                  type="number"
                  value={formData.exemptionOutsideTalatona}
                  onChange={(e) => setFormData(prev => ({ ...prev, exemptionOutsideTalatona: parseInt(e.target.value) || 0 }))}
                  className="w-32"
                />
                <span className="text-muted-foreground">Kz</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Encomendas acima deste valor têm entrega gratuita fora de Talatona.
                Use 0 para desativar isenção.
              </p>
              <p className="text-sm font-medium text-green-600">
                Entrega gratuita acima de {formatCurrency(formData.exemptionOutsideTalatona)}
              </p>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <strong>Nota:</strong> As entregas em Viana/Kilamba e zonas adjacentes 
                não têm isenção de taxa (sempre pagas).
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
