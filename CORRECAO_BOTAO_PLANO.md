# Correção do Problema do Botão de Plano

## 🐛 Problema Reportado

Ambos os botões (Mensal e Anual) estão abrindo sempre no plano Anual.

## 🔍 Análise

O código do botão está correto:

```tsx
<Button 
  className="w-full"
  onClick={() => handleUpgrade(plan.interval === 'month' ? 'monthly' : 'yearly')}
>
  Assinar {plan.interval === 'month' ? 'Mensal' : 'Anual'}
</Button>
```

O problema pode estar em:
1. **Dados retornados pela API** - A API `subscriptionApi.getPlans()` pode não estar retornando os planos corretamente
2. **Estado inicial** - O estado `selectedPlan` inicia como `'monthly'` mas pode estar sendo sobrescrito

## 🔧 Solução

### Verificar os Dados da API

Primeiro, vamos verificar o que a API está retornando:

```typescript
// No arquivo: backend/src/controllers/subscription.controller.ts
// Verifique se existe um endpoint para listar planos
```

### Problema Identificado

A página `Subscription.tsx` está tentando buscar planos de uma API que **não existe ainda**!

```tsx
const { data: plans } = useQuery({
  queryKey: ['plans'],
  queryFn: subscriptionApi.getPlans, // ❌ Este endpoint não foi implementado
})
```

## ✅ Solução Implementada

Vou criar planos estáticos no frontend já que os valores são fixos:

### Opção 1: Usar Planos Estáticos (Recomendado)

Substitua a busca de planos por dados estáticos:

```tsx
const plans = [
  {
    id: 'monthly',
    name: 'Premium Mensal',
    type: 'PREMIUM',
    interval: 'month',
    price: 29.90,
    currency: 'BRL',
    features: [
      'Downloads ilimitados',
      'Qualidade original',
      'Velocidade prioritária',
      'Histórico completo',
      'Até 3 downloads simultâneos',
      'Suporte prioritário',
    ],
  },
  {
    id: 'yearly',
    name: 'Premium Anual',
    type: 'PREMIUM',
    interval: 'year',
    price: 299.00,
    currency: 'BRL',
    features: [
      'Downloads ilimitados',
      'Qualidade original',
      'Velocidade prioritária',
      'Histórico completo',
      'Até 3 downloads simultâneos',
      'Suporte prioritário',
      '2 meses grátis!',
    ],
  },
];
```

### Opção 2: Criar Endpoint de Planos no Backend

Se preferir buscar da API, crie o endpoint:

```typescript
// backend/src/controllers/subscription.controller.ts
export const getPlans = async (req: Request, res: Response) => {
  const plans = [
    {
      id: 'monthly',
      name: 'Premium Mensal',
      type: 'PREMIUM',
      interval: 'month',
      price: 29.90,
      currency: 'BRL',
      features: [
        'Downloads ilimitados',
        'Qualidade original',
        'Velocidade prioritária',
        'Histórico completo',
        'Até 3 downloads simultâneos',
        'Suporte prioritário',
      ],
    },
    {
      id: 'yearly',
      name: 'Premium Anual',
      type: 'PREMIUM',
      interval: 'year',
      price: 299.00,
      currency: 'BRL',
      features: [
        'Downloads ilimitados',
        'Qualidade original',
        'Velocidade prioritária',
        'Histórico completo',
        'Até 3 downloads simultâneos',
        'Suporte prioritário',
        '2 meses grátis!',
      ],
    },
  ];

  res.json(plans);
};
```

E adicione a rota:

```typescript
// backend/src/routes/subscription.routes.ts
router.get('/plans', getPlans);
```

## 🧪 Como Testar

1. Abra o console do navegador (F12)
2. Vá para a aba "Console"
3. Digite: `console.log(plans)`
4. Verifique se os planos têm `interval: 'month'` e `interval: 'year'`
5. Clique em cada botão e veja qual plano é selecionado

## 📝 Debug Adicional

Adicione logs temporários no código:

```tsx
const handleUpgrade = (planType: 'monthly' | 'yearly') => {
  console.log('Plano selecionado:', planType); // 👈 Adicione este log
  setSelectedPlan(planType)
  setShowPaymentModal(true)
}
```

E no botão:

```tsx
onClick={() => {
  const planType = plan.interval === 'month' ? 'monthly' : 'yearly';
  console.log('Plan interval:', plan.interval, '-> planType:', planType); // 👈 Log
  handleUpgrade(planType);
}}
```

## ✅ Verificação Final

Após a correção, teste:
1. ✅ Botão "Assinar Mensal" abre modal com valor R$ 29,90
2. ✅ Botão "Assinar Anual" abre modal com valor R$ 299,00
3. ✅ Cada botão seleciona o plano correto

---

**Status**: Aguardando implementação da solução escolhida (Opção 1 ou 2).
