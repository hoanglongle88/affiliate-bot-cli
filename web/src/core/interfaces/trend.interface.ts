export interface TrendBriefResult {
  brief: {
    product: {
      name: string;
      price: string;
      views: string;
      trendPercent: string;
    };
    hook: string;
    angle: string;
    painPoint: string;
    ctaAngle: string;
    hashtags: string[];
  };
  product: { id: string; name: string };
}

export interface TrendResponse {
  brief: {
    product: {
      name: string;
      price: string;
      views: string;
      trendPercent: string;
    };
    hook: string;
    angle: string;
    painPoint: string;
    ctaAngle: string;
    hashtags: string[];
  };
  product: { id: string; name: string };
}
