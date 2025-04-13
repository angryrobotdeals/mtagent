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

export enum DEAL_TYPE {
  BUY = 0, // Покупка
  SELL = 1, // Продажа
  BALANCE = 2, // Пополнение баланса
  CREDIT = 3, // Начисление кредита
  CHARGE = 4, // Дополнительные сборы
  CORRECTION = 5, // Корректирующая запись
  BONUS = 6, // Начисление бонуса
  COMMISSION = 7, // Дополнительные комиссии
  COMMISSION_DAILY = 8, // Комиссия, начисляемая в конце торгового дня
  COMMISSION_MONTHLY = 9, // Комиссия, начисляемая в конце месяца
  COMMISSION_AGENT_DAILY = 10, // Агентская комиссия, начисляемая в конце торгового дня
  COMMISSION_AGENT_MONTHLY = 11, // Агентская комиссия, начисляемая в конце месяца
  BUY_CANCELED = 13, // Отмена покупки
  INTEREST = 12, // Начисления процентов на свободные средства
  SELL_CANCELED = 14, // Отмена продажи
  DEAL_DIVIDEND = 15, // Начисление дивиденда
  DEAL_DIVIDEND_FRANKED = 16, // Начисление франкированного дивиденда (освобожденного от уплаты налога)
  DEAL_TAX = 17, // Начисление налога
  OTHER = 9999, // Другое
}

export type HistoryArray = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,

  string,
  string,
  string,
  string,

  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface History {
  client_id: string;

  time: number;
  deal_ticket: number;
  order_ticket: number;
  magic: number;
  entry: number;
  reason: number;
  position: number;

  action: string;
  symbol: string;
  comment: string;
  external_deal_id: string;

  volume: number;
  price: number;
  profit: number;
  commission: number;
  swap: number;
  fee: number;
  stop_loss: number;
  take_profit: number;
}
