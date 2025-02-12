export interface User {
  username: string;
  token?: string;
}

export interface Signal {
  signal_id?: string;
  client_id: string;
  action: string;
  direction?: string;
  symbol: string;
  volume?: number;
  stop_loss?: number;
  take_profit?: number;
  partial_close_pct?: number;
  multi_take_profits?: { price: number; pct: number }[];
}
