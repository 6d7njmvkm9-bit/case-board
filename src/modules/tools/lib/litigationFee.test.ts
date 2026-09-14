import { describe, expect, it } from "vitest";

import { calculatePropertyFee } from "./litigationFee";

/** 按《诉讼费用交纳办法》第十三条逐段累加,独立于速算常数的对照实现。 */
function cumulativeFee(amount: number): number {
  if (amount <= 10000) return 50;
  const segments: Array<[number, number]> = [
    [100000, 0.025],
    [200000, 0.02],
    [500000, 0.015],
    [1000000, 0.01],
    [2000000, 0.009],
    [5000000, 0.008],
    [10000000, 0.007],
    [20000000, 0.006],
    [Infinity, 0.005],
  ];
  let fee = 50;
  let lower = 10000;
  for (const [upper, rate] of segments) {
    if (amount <= lower) break;
    fee += (Math.min(amount, upper) - lower) * rate;
    lower = upper;
  }
  return Math.round(fee);
}

describe("calculatePropertyFee", () => {
  it("各档边界与法定累计值一致", () => {
    expect(calculatePropertyFee(1)).toBe(50);
    expect(calculatePropertyFee(10)).toBe(2300);
    expect(calculatePropertyFee(20)).toBe(4300);
    expect(calculatePropertyFee(50)).toBe(8800);
    expect(calculatePropertyFee(100)).toBe(13800);
    expect(calculatePropertyFee(200)).toBe(22800);
    expect(calculatePropertyFee(500)).toBe(46800);
    expect(calculatePropertyFee(1000)).toBe(81800);
    expect(calculatePropertyFee(2000)).toBe(141800);
  });

  it("档内取值(10 万以上)按速算常数「加」", () => {
    expect(calculatePropertyFee(15)).toBe(3300);
    expect(calculatePropertyFee(30)).toBe(5800);
    expect(calculatePropertyFee(3000)).toBe(191800);
  });

  it("任意金额与逐段累加对照实现一致", () => {
    for (const wan of [1.5, 9.99, 10.01, 18, 37, 66, 150, 321, 777, 1500, 5000]) {
      expect(calculatePropertyFee(wan)).toBe(cumulativeFee(wan * 10000));
    }
  });
});
