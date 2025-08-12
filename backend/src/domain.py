from __future__ import annotations

import locale
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Generator, List, Tuple

from dateutil.relativedelta import relativedelta


DATE_FMT = "%d/%m/%Y"


def parse_date(value: str) -> date:
    return datetime.strptime(value, DATE_FMT).date()


def last_day_of_month(d: date) -> date:
    first_next_month = d.replace(day=1) + relativedelta(months=+1)
    return first_next_month - timedelta(days=1)


def month_name_es(d: date) -> str:
    try:
        locale.setlocale(locale.LC_TIME, "es_ES.UTF-8")
    except locale.Error:
        try:
            locale.setlocale(locale.LC_TIME, "es_ES")
        except locale.Error:
            nombres = [
                "enero",
                "febrero",
                "marzo",
                "abril",
                "mayo",
                "junio",
                "julio",
                "agosto",
                "septiembre",
                "octubre",
                "noviembre",
                "diciembre",
            ]
            return nombres[d.month - 1].capitalize()
    return d.strftime("%B").capitalize()


def daterange_monthly(start: date, end: date) -> Generator[Tuple[date, date], None, None]:
    current_start = start
    while current_start <= end:
        month_end = last_day_of_month(current_start)
        current_end = min(month_end, end)
        yield current_start, current_end
        current_start = current_end + timedelta(days=1)


def calculate_rows(start: date, end: date, base: float, monthly_rate_pct: float):
    rows = []
    total_interest = 0
    for dt_start, dt_end in daterange_monthly(start, end):
        days = (dt_end - dt_start).days + 1
        interest = base * (monthly_rate_pct / 100.0) * (days / 30.0)
        interest_rounded = int(round(interest))
        total_interest += interest_rounded
        rows.append(
            {
                "mes": month_name_es(dt_start),
                "del": dt_start.strftime(DATE_FMT),
                "hasta": dt_end.strftime(DATE_FMT),
                "dias": days,
                "base": base,
                "tasa": monthly_rate_pct,
                "interes": interest_rounded,
            }
        )
    return rows, int(total_interest)


def generate_tramos(start: date, end: date, base: float, monthly_rate_pct: float, vencimiento: date | None):
    if vencimiento is None or not (start < vencimiento <= end):
        rows, total = calculate_rows(start, end, base, monthly_rate_pct)
        return {
            "tramos": [
                {
                    "titulo": "TABLA DE LIQUIDACIÓN GENERAL DEL CRÉDITO",
                    "rows": rows,
                    "subtotal": total,
                }
            ],
            "total": total,
        }

    tramo1_end = vencimiento - timedelta(days=1)
    rows1, subtotal1 = calculate_rows(start, tramo1_end, base, monthly_rate_pct)
    rd = relativedelta(vencimiento, start)
    meses_credito = rd.years * 12 + rd.months
    if rd.days > 0:
        meses_credito += 1

    rows2, subtotal2 = calculate_rows(vencimiento, end, base, monthly_rate_pct)

    return {
        "tramos": [
            {
                "titulo": f"TABLA DE LIQUIDACIÓN GENERAL DEL CRÉDITO DE HIPOTECA {meses_credito} MESES",
                "rows": rows1,
                "subtotal": subtotal1,
            },
            {
                "titulo": "TABLA DE LIQUIDACIÓN GENERAL DEL CRÉDITO DE HIPOTECA DESDE QUE SE VENCE EL PLAZO PACTADO",
                "rows": rows2,
                "subtotal": subtotal2,
            },
        ],
        "total": int(subtotal1 + subtotal2),
    }


