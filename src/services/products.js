const API_BASE = 'https://dummyjson.com';
let catalogCache = null;
const productCache = new Map();

const CATEGORY_TRANSLATIONS = {
  smartphones: 'Смартфоны',
  laptops: 'Ноутбуки',
  fragrances: 'Духи',
  skincare: 'Уход за кожей',
  groceries: 'Продукты',
  'home-decoration': 'Декор',
  furniture: 'Мебель',
  tops: 'Топы',
  'women-dresses': 'Платья',
  'women-shoes': 'Женская обувь',
  'mens-shirts': 'Мужские рубашки',
  'mens-shoes': 'Мужская обувь',
  'mens-watches': 'Мужские часы',
  'womens-watches': 'Женские часы',
  'womens-bags': 'Женские сумки',
  'womens-jewellery': 'Женские украшения',
  sunglasses: 'Солнцезащитные очки',
  automotive: 'Автоаксессуары',
  motorcycle: 'Мотоциклы',
  lighting: 'Освещение',
};

const TRANSLATION_DICTIONARY = {
  mens: 'мужская',
  "men's": 'мужской',
  men: 'мужской',
  women: 'женский',
  womens: 'женская',
  womens: 'женская',
  jackets: 'куртки',
  jacket: 'куртка',
  shirts: 'рубашки',
  shirt: 'рубашка',
  shoes: 'обувь',
  sneakers: 'кроссовки',
  bag: 'сумка',
  bags: 'сумки',
  watch: 'часы',
  watches: 'часы',
  jeans: 'джинсы',
  sofa: 'диван',
  underwear: 'бельё',
  jacket: 'куртка',
  menswear: 'мужская одежда',
  womenswear: 'женская одежда',
  cotton: 'хлопок',
  leather: 'кожа',
  wireless: 'беспроводные',
  bluetooth: 'Bluetooth',
  water: 'водонепроницаемый',
  resistant: 'устойчивый',
  leather: 'кожаный',
  organic: 'органический',
  modern: 'современный',
  premium: 'премиальный',
  classic: 'классический',
  soft: 'мягкий',
  light: 'легкий',
  lightweight: 'лёгкий',
  jacket: 'куртка',
  travel: 'путешествия',
  organizer: 'органайзер',
  backpack: 'рюкзак',
  mobile: 'мобильный',
  professional: 'профессиональный',
  luxury: 'люкс',
  premium: 'премиум',
  'smart watch': 'смарт-часы',
};

const translateText = (text) => {
  if (!text) return text;
  return text
    .split(/(\s+)/)
    .map((token) => {
      const key = token.toLowerCase().replace(/[^a-z0-9-']/gi, '');
      if (TRANSLATION_DICTIONARY[key]) {
        const translated = TRANSLATION_DICTIONARY[key];
        return token[0] === token[0].toUpperCase() ? translated.charAt(0).toUpperCase() + translated.slice(1) : translated;
      }
      return token;
    })
    .join('');
};

const buildImage = (product) => product.thumbnail || product.images?.[0] || '';

const validProduct = (product) => Boolean(buildImage(product) && product.title && product.description);

const translateCategory = (category, locale) => {
  if (locale !== 'ru') return category;
  return CATEGORY_TRANSLATIONS[category] || category;
};

const applyLocale = (product, locale) => {
  const rawCategory = product.category;
  const categoryLabel = locale === 'ru' ? translateCategory(rawCategory, locale) : rawCategory;
  const base = {
    id: String(product.id),
    name: product.title || product.name,
    category: rawCategory,
    categoryLabel,
    description: locale === 'ru' ? translateText(product.description) : product.description,
    image: buildImage(product),
    price: product.price,
    discount: Math.round(product.discountPercentage ?? product.discount ?? 0),
    rating: product.rating ?? 0,
    stock: product.stock ?? 0,
    details: product.details && product.details.length > 0 ? product.details : [
      product.brand || rawCategory,
      `Stock: ${product.stock ?? 'N/A'}`,
      `Rating: ${product.rating?.toFixed(1) ?? 'N/A'}`,
    ],
  };

  if (locale === 'ru') {
    return {
      ...base,
      title: translateText(product.title || product.name),
      name: translateText(product.title || product.name),
      details: base.details.map((detail) => translateText(detail)),
    };
  }

  return {
    ...base,
    title: product.title || product.name,
  };
};

export const fetchProducts = async (limit = 100, locale = 'en') => {
  if (!catalogCache) {
    const response = await fetch(`${API_BASE}/products?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Unable to load products');
    }
    const data = await response.json();
    catalogCache = data.products.filter(validProduct);
    catalogCache.forEach((product) => productCache.set(String(product.id), product));
  }
  return catalogCache
    .slice(0, limit)
    .map((product) => applyLocale(product, locale));
};

export const fetchCategories = async (locale = 'en') => {
  const response = await fetch(`${API_BASE}/products/categories`);
  if (!response.ok) {
    throw new Error('Unable to load categories');
  }
  const data = await response.json();
  return data.map((category) => {
    const slug = typeof category === 'string' ? category : category.slug || String(category.name).toLowerCase().replace(/\s+/g, '-');
    const label = locale === 'ru' ? translateCategory(slug, locale) : slug;
    return { value: slug, label };
  });
};

export const fetchProductById = async (id, locale = 'en') => {
  if (!id || Number.isNaN(Number(id))) {
    throw new Error('PRODUCT_NOT_FOUND');
  }
  const cachedProduct = productCache.get(String(id));
  if (cachedProduct) return applyLocale(cachedProduct, locale);

  const response = await fetch(`${API_BASE}/products/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('PRODUCT_NOT_FOUND');
    }
    throw new Error('PRODUCT_API_ERROR');
  }
  const product = await response.json();
  if (!validProduct(product)) {
    throw new Error('PRODUCT_NOT_FOUND');
  }
  productCache.set(String(product.id), product);
  return applyLocale(product, locale);
};

export const getCategoryTranslation = (category, locale) => translateCategory(category, locale);
