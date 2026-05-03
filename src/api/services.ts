import { z } from 'zod';
import { mapDtoToCartService } from '@/components/OnboardingForm/cartCatalog';

const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const BASE_URL = envUrl || 'https://api.nius.cz';

/** Public catalog of active services (backend: isActive + isPublic only). */
export const publicServiceSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  priceHalers: z.number(),
  kind: z.enum(['standard', 'escort']),
  iconKey: z.string(),
  durationMin: z.number(),
});

export type PublicServiceDto = z.infer<typeof publicServiceSchema>;

function parseWithSchema<T>(schema: z.ZodType<T>, data: unknown, status: number): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    console.warn('[services] GET /services response failed schema validation', parsed.error.flatten());
    throw new Error(`invalid_services_response_${status}`);
  }
  return parsed.data;
}

export async function fetchServices(): Promise<PublicServiceDto[]> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/services`);
  } catch {
    throw new Error('network_services');
  }
  if (!response.ok) {
    throw new Error(`services_http_${response.status}`);
  }
  const raw: unknown = await response.json().catch(() => undefined);
  return parseWithSchema(z.array(publicServiceSchema), raw ?? [], response.status);
}

export async function fetchServicesCatalog(): Promise<CartService[]> {
  const rows = await fetchServices();
  return rows.map((row) => mapDtoToCartService(row));
}
