import React, { useState } from 'react';
import { VistoriaPonto } from '../../types';
import { Camera, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface Props {
  veiculoPlaca: string;
  condutorNome: string;
  tipo: 'Saída' | 'Retorno';
  onComplete: (pontos: VistoriaPonto[], temAvaria: boolean) => void;
  onCancel: () => void;
}

const VISTAS: ('Frente' | 'Traseira' | 'Lateral Direita' | 'Lateral Esquerda')[] = [
  'Frente',
  'Traseira',
  'Lateral Direita',
  'Lateral Esquerda',
];

const PONTOS_BASE = [
  'Faróis / Lanternas Próprias',
  'Para-choque & Grade Frontal',
  'Para-brisa & Palhetas',
  'Pneus & Calotas / Rodas',
  'Lataria & Pintura Exterior',
  'Retrovisores & Vidros',
];

export const VistoriaFotos: React.FC<Props> = ({ veiculoPlaca, condutorNome, tipo, onComplete, onCancel }) => {
  // Generate all 24 points (4 vistas x 6 pontos)
  const [pontos, setPontos] = useState<VistoriaPonto[]>(() => {
    const list: VistoriaPonto[] = [];
    let idCounter = 1;
    VISTAS.forEach((vista) => {
      PONTOS_BASE.forEach((nomePonto) => {
        list.push({
          ponto_id: idCounter++,
          nome: `${nomePonto} (${vista})`,
          vista,
          status: 'ok',
        });
      });
    });
    return list;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [avariaObs, setAvariaObs] = useState('');

  const currentPonto = pontos[currentIndex];

  const handleMarkOK = () => {
    const updated = [...pontos];
    updated[currentIndex] = { ...currentPonto, status: 'ok' };
    setPontos(updated);
    setPhotoPreview(null);
    setAvariaObs('');

    if (currentIndex < pontos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmAvaria = () => {
    if (!photoPreview) {
      alert('A foto da avaria é obrigatória!');
      return;
    }

    const updated = [...pontos];
    updated[currentIndex] = {
      ...currentPonto,
      status: 'avaria',
      foto_url: photoPreview,
      observacao: avariaObs,
    };
    setPontos(updated);
    setPhotoPreview(null);
    setAvariaObs('');

    if (currentIndex < pontos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const isFinished = currentIndex === pontos.length - 1 && currentPonto.status !== undefined;
  const temAlgumaAvaria = pontos.some((p) => p.status === 'avaria');

  const handleFinishChecklist = () => {
    onComplete(pontos, temAlgumaAvaria);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-6 flex flex-col max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              Vistoria Guiada 24 Pontos • {tipo}
            </span>
            <h2 className="text-lg font-bold text-foreground mt-1">Veículo: {veiculoPlaca}</h2>
            <p className="text-xs text-muted-foreground">Condutor: {condutorNome}</p>
          </div>

          <button onClick={onCancel} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span>Ponto {currentIndex + 1} de {pontos.length}</span>
            <span>Vista: {currentPonto.vista}</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / pontos.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Inspection Point View */}
        <div className="p-5 bg-muted/40 border border-border rounded-xl space-y-4 text-center">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider font-extrabold text-primary">{currentPonto.vista}</p>
            <h3 className="text-xl font-extrabold text-foreground">{currentPonto.nome}</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={handleMarkOK}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Sem Avaria (OK)</span>
            </button>

            <label className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Camera className="w-5 h-5" />
              <span>Registrar Avaria + Foto</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCapturePhoto}
                className="hidden"
              />
            </label>
          </div>

          {/* Photo Preview if capturing damage */}
          {photoPreview && (
            <div className="p-4 bg-background border border-rose-500/30 rounded-xl space-y-3 text-left animate-in fade-in">
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Avaria Detectada - Foto de Evidência:
              </p>
              
              <img src={photoPreview} alt="Avaria" className="w-full h-40 object-cover rounded-lg border border-border" />

              <input
                type="text"
                placeholder="Descreva detalhadamente a avaria (ex: arranhão de 5cm, farol trincado)"
                value={avariaObs}
                onChange={(e) => setAvariaObs(e.target.value)}
                className="w-full p-2 text-xs bg-background border border-input rounded"
              />

              <button
                onClick={handleConfirmAvaria}
                className="w-full py-2 bg-rose-600 text-white text-xs font-bold rounded-lg shadow hover:bg-rose-700"
              >
                Salvar Avaria e Continuar
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-3 py-1.5 bg-muted text-xs font-medium rounded-lg disabled:opacity-30 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Anterior
          </button>

          {currentIndex === pontos.length - 1 ? (
            <button
              onClick={handleFinishChecklist}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow hover:bg-primary/90 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Concluir Vistoria Fotográfica
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(pontos.length - 1, prev + 1))}
              className="px-3 py-1.5 bg-secondary text-xs font-medium rounded-lg flex items-center gap-1"
            >
              Próximo
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
