import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { usePhone, useCreatePhone, useUpdatePhone } from '@/hooks/usePhones';
import { MercadoLibreSearch } from '@/components/admin/MercadoLibreSearch';
import { smartphoneToRow } from '@/lib/supabase';

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const storePriceSchema = z.object({
  store: z.string().min(1, 'Nombre de tienda requerido'),
  price: z.number({ invalid_type_error: 'Ingresá un precio' }).nullable(),
  url: z.string().url('URL inválida').or(z.literal('')),
  available: z.boolean(),
});

const phoneFormSchema = z.object({
  id: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones (ej: samsung-galaxy-s25)'),
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  brand: z.string().min(1, 'Marca requerida'),
  year: z.number({ invalid_type_error: 'Año inválido' }).int().min(2020).max(2035),
  gama: z.enum(['alta', 'media', 'baja']),
  image: z.string().url('Debe ser una URL válida'),
  review: z.string().min(10, 'Mínimo 10 caracteres'),
  specs: z.object({
    display: z.string().min(1, 'Requerido'),
    processor: z.string().min(1, 'Requerido'),
    ram: z.string().min(1, 'Requerido'),
    storage: z.string().min(1, 'Requerido'),
    mainCamera: z.string().min(1, 'Requerido'),
    frontCamera: z.string().min(1, 'Requerido'),
    battery: z.string().min(1, 'Requerido'),
    charging: z.string().min(1, 'Requerido'),
    connectivity: z.string().min(1, 'Requerido'),
    os: z.string().min(1, 'Requerido'),
    dimensions: z.string().optional(),
    weight: z.string().optional(),
    extras: z.string().optional(),
  }),
  pros: z.array(z.object({ value: z.string().min(1, 'Escribí un punto positivo') })).min(1),
  cons: z.array(z.object({ value: z.string().min(1, 'Escribí un punto negativo') })).min(1),
  forWho: z.string().min(10, 'Mínimo 10 caracteres'),
  prices: z.array(storePriceSchema),
  has5G: z.boolean(),
  hasNFC: z.boolean(),
});

type PhoneFormData = z.infer<typeof phoneFormSchema>;

const defaultValues: PhoneFormData = {
  id: '',
  name: '',
  brand: '',
  year: new Date().getFullYear(),
  gama: 'media',
  image: '',
  review: '',
  specs: {
    display: '',
    processor: '',
    ram: '',
    storage: '',
    mainCamera: '',
    frontCamera: '',
    battery: '',
    charging: '',
    connectivity: '',
    os: '',
    dimensions: '',
    weight: '',
    extras: '',
  },
  pros: [{ value: '' }],
  cons: [{ value: '' }],
  forWho: '',
  prices: [],
  has5G: false,
  hasNFC: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const inputClass = 'w-full px-3 py-2 rounded-lg bg-secondary border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm';
const labelClass = 'block text-sm font-medium text-foreground mb-1.5';
const errorClass = 'text-xs text-destructive mt-1';
const sectionClass = 'glass-card p-6 mb-6';

// ─── Component ────────────────────────────────────────────────────────────────
export default function PhoneForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: existingPhone, isLoading: isLoadingPhone } = usePhone(id ?? '');
  const create = useCreatePhone();
  const update = useUpdatePhone();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues,
  });

  const { fields: prosFields, append: appendPro, remove: removePro } = useFieldArray({ control, name: 'pros' });
  const { fields: consFields, append: appendCon, remove: removeCon } = useFieldArray({ control, name: 'cons' });
  const { fields: pricesFields, append: appendPrice, remove: removePrice } = useFieldArray({ control, name: 'prices' });

  // En modo edit, poblar el formulario cuando cargan los datos
  useEffect(() => {
    if (isEdit && existingPhone) {
      reset({
        id: existingPhone.id,
        name: existingPhone.name,
        brand: existingPhone.brand,
        year: existingPhone.year,
        gama: existingPhone.gama,
        image: existingPhone.image,
        review: existingPhone.review,
        specs: existingPhone.specs,
        pros: existingPhone.pros.map(v => ({ value: v })),
        cons: existingPhone.cons.map(v => ({ value: v })),
        forWho: existingPhone.forWho,
        prices: existingPhone.prices,
        has5G: existingPhone.has5G,
        hasNFC: existingPhone.hasNFC,
      });
    }
  }, [existingPhone, isEdit, reset]);

  const watchedName = watch('name');

  const onSubmit = async (data: PhoneFormData) => {
    const phoneRow = smartphoneToRow({
      ...data,
      pros: data.pros.map(p => p.value),
      cons: data.cons.map(c => c.value),
      customImage: null,
    });

    const priceRows = data.prices.map(p => ({
      store: p.store,
      price: p.price,
      url: p.url || null,
      available: p.available,
    }));

    try {
      if (isEdit) {
        await update.mutateAsync({ id: id!, phone: phoneRow, prices: priceRows });
      } else {
        await create.mutateAsync({ phone: phoneRow, prices: priceRows });
      }
      navigate('/admin');
    } catch (err: unknown) {
      console.error('Error al guardar:', err);
    }
  };

  const handleMLPrice = (price: number, url: string) => {
    const existingIdx = pricesFields.findIndex(f => f.store === 'Mercado Libre');
    if (existingIdx >= 0) {
      setValue(`prices.${existingIdx}.price`, price);
      setValue(`prices.${existingIdx}.url`, url);
    } else {
      appendPrice({ store: 'Mercado Libre', price, url, available: true });
    }
  };

  if (isEdit && isLoadingPhone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const mutationError = create.error || update.error;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="font-medium text-foreground">
              {isEdit ? 'Editar teléfono' : 'Agregar teléfono'}
            </span>
          </div>
          <button
            type="submit"
            form="phone-form"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </header>

      <main className="container py-8 max-w-3xl">
        {mutationError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-destructive">{mutationError.message}</p>
          </div>
        )}

        <form id="phone-form" onSubmit={handleSubmit(onSubmit)} className="space-y-0">
          {/* Información básica */}
          <div className={sectionClass}>
            <h2 className="text-base font-semibold text-foreground mb-4">Información básica</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>ID único *</label>
                <input {...register('id')} disabled={isEdit} className={`${inputClass} ${isEdit ? 'opacity-60 cursor-not-allowed' : ''}`} placeholder="samsung-galaxy-s25" />
                {errors.id && <p className={errorClass}>{errors.id.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">Solo minúsculas, números y guiones</p>
              </div>
              <div>
                <label className={labelClass}>Nombre completo *</label>
                <input {...register('name')} className={inputClass} placeholder="Samsung Galaxy S25" />
                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Marca *</label>
                <input {...register('brand')} className={inputClass} placeholder="Samsung" />
                {errors.brand && <p className={errorClass}>{errors.brand.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Año *</label>
                <input {...register('year', { valueAsNumber: true })} type="number" className={inputClass} />
                {errors.year && <p className={errorClass}>{errors.year.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Gama *</label>
                <select {...register('gama')} className={inputClass}>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
                {errors.gama && <p className={errorClass}>{errors.gama.message}</p>}
              </div>
              <div>
                <label className={labelClass}>URL de imagen *</label>
                <input {...register('image')} className={inputClass} placeholder="https://..." />
                {errors.image && <p className={errorClass}>{errors.image.message}</p>}
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('has5G')} className="rounded border-border" />
                <span className="text-sm text-foreground">Tiene 5G</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('hasNFC')} className="rounded border-border" />
                <span className="text-sm text-foreground">Tiene NFC</span>
              </label>
            </div>
          </div>

          {/* Especificaciones técnicas */}
          <div className={sectionClass}>
            <h2 className="text-base font-semibold text-foreground mb-4">Especificaciones técnicas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { field: 'specs.display', label: 'Pantalla', placeholder: '6.2" AMOLED, 2340x1080, 120Hz' },
                { field: 'specs.processor', label: 'Procesador', placeholder: 'Snapdragon 8 Elite' },
                { field: 'specs.ram', label: 'RAM', placeholder: '12GB' },
                { field: 'specs.storage', label: 'Almacenamiento', placeholder: '256GB / 512GB' },
                { field: 'specs.mainCamera', label: 'Cámara principal', placeholder: '50MP f/1.8 + 12MP ultra + 10MP tele' },
                { field: 'specs.frontCamera', label: 'Cámara frontal', placeholder: '12MP f/2.2' },
                { field: 'specs.battery', label: 'Batería', placeholder: '4000mAh' },
                { field: 'specs.charging', label: 'Carga', placeholder: '45W carga rápida, 15W inalámbrica' },
                { field: 'specs.connectivity', label: 'Conectividad', placeholder: '5G, Wi-Fi 7, Bluetooth 5.4, NFC' },
                { field: 'specs.os', label: 'Sistema operativo', placeholder: 'Android 15, One UI 7' },
                { field: 'specs.dimensions', label: 'Dimensiones (opcional)', placeholder: '147 x 70.6 x 7.2 mm' },
                { field: 'specs.weight', label: 'Peso (opcional)', placeholder: '167g' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <input
                    {...register(field as Parameters<typeof register>[0])}
                    className={inputClass}
                    placeholder={placeholder}
                  />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(errors as any)[field.split('.')[0]]?.[field.split('.')[1]] && (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <p className={errorClass}>{(errors as any)[field.split('.')[0]]?.[field.split('.')[1]]?.message}</p>
                  )}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className={labelClass}>Extras (opcional)</label>
                <input
                  {...register('specs.extras')}
                  className={inputClass}
                  placeholder="IP68, USB-C 3.2, S Pen, certificación MIL-SPEC..."
                />
              </div>
            </div>
          </div>

          {/* Review y Para quién */}
          <div className={sectionClass}>
            <h2 className="text-base font-semibold text-foreground mb-4">Review y descripción</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Review *</label>
                <textarea
                  {...register('review')}
                  rows={4}
                  className={inputClass}
                  placeholder="Describí el teléfono, sus características principales y experiencia de uso..."
                />
                {errors.review && <p className={errorClass}>{errors.review.message}</p>}
              </div>
              <div>
                <label className={labelClass}>¿Para quién conviene? *</label>
                <textarea
                  {...register('forWho')}
                  rows={2}
                  className={inputClass}
                  placeholder="Usuarios que buscan el mejor rendimiento para gaming y fotografía..."
                />
                {errors.forWho && <p className={errorClass}>{errors.forWho.message}</p>}
              </div>
            </div>
          </div>

          {/* Pros */}
          <div className={sectionClass}>
            <h2 className="text-base font-semibold text-foreground mb-4">Puntos positivos</h2>
            <div className="space-y-2">
              {prosFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`pros.${idx}.value`)}
                    className={inputClass}
                    placeholder={`Pro ${idx + 1}`}
                  />
                  {prosFields.length > 1 && (
                    <button type="button" onClick={() => removePro(idx)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {errors.pros && <p className={errorClass}>{errors.pros.message}</p>}
              <button type="button" onClick={() => appendPro({ value: '' })}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1">
                <Plus className="h-3.5 w-3.5" /> Agregar punto
              </button>
            </div>
          </div>

          {/* Cons */}
          <div className={sectionClass}>
            <h2 className="text-base font-semibold text-foreground mb-4">Puntos negativos</h2>
            <div className="space-y-2">
              {consFields.map((field, idx) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`cons.${idx}.value`)}
                    className={inputClass}
                    placeholder={`Con ${idx + 1}`}
                  />
                  {consFields.length > 1 && (
                    <button type="button" onClick={() => removeCon(idx)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {errors.cons && <p className={errorClass}>{errors.cons.message}</p>}
              <button type="button" onClick={() => appendCon({ value: '' })}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1">
                <Plus className="h-3.5 w-3.5" /> Agregar punto
              </button>
            </div>
          </div>

          {/* Precios */}
          <div className={sectionClass}>
            <h2 className="text-base font-semibold text-foreground mb-4">Precios por tienda</h2>

            {/* Búsqueda en MercadoLibre */}
            <div className="mb-4">
              <MercadoLibreSearch
                phoneName={watchedName}
                onSelectPrice={handleMLPrice}
              />
            </div>

            <div className="space-y-3">
              {pricesFields.map((field, idx) => (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-secondary/20 rounded-lg">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Tienda</label>
                    <input {...register(`prices.${idx}.store`)} className={inputClass} placeholder="Frávega" />
                    {errors.prices?.[idx]?.store && <p className={errorClass}>{errors.prices[idx]?.store?.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Precio (ARS)</label>
                    <input
                      {...register(`prices.${idx}.price`, { setValueAs: v => v === '' ? null : Number(v) })}
                      type="number"
                      className={inputClass}
                      placeholder="1500000"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">URL (opcional)</label>
                    <input {...register(`prices.${idx}.url`)} className={inputClass} placeholder="https://..." />
                    {errors.prices?.[idx]?.url && <p className={errorClass}>{errors.prices[idx]?.url?.message}</p>}
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-sm mb-2">
                      <input type="checkbox" {...register(`prices.${idx}.available`)} className="rounded" />
                      En stock
                    </label>
                    <button type="button" onClick={() => removePrice(idx)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors mb-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => appendPrice({ store: '', price: null, url: '', available: true })}
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar tienda
              </button>
            </div>
          </div>

          {/* Submit (móvil) */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/admin"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:brightness-110 disabled:opacity-50 transition-all"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar teléfono' : 'Crear teléfono'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
