"use client";

import { useEffect, useState } from "react";

const format = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });

// The time in Mumbai, so a visitor knows when he's likely to answer.
export function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(format.format(new Date()).toLowerCase());
    update();
    const timer = window.setInterval(update, 15000);
    return () => window.clearInterval(timer);
  }, []);
  return <span className="header__fact">Mumbai{time && `, ${time}`}</span>;
}
