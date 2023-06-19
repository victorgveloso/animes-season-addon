import { monthToSeason, Season } from '../src/query';

describe('monthToSeason', () => {
    it('should return WINTER for December, January, and February', () => {
      expect(monthToSeason(11)).toBe(Season.WINTER);
      expect(monthToSeason(0)).toBe(Season.WINTER);
      expect(monthToSeason(1)).toBe(Season.WINTER);
    });
  
    it('should return SPRING for March, April, and May', () => {
      expect(monthToSeason(2)).toBe(Season.SPRING);
      expect(monthToSeason(3)).toBe(Season.SPRING);
      expect(monthToSeason(4)).toBe(Season.SPRING);
    });
  
    it('should return SUMMER for June, July, and August', () => {
      expect(monthToSeason(5)).toBe(Season.SUMMER);
      expect(monthToSeason(6)).toBe(Season.SUMMER);
      expect(monthToSeason(7)).toBe(Season.SUMMER);
    });
  
    it('should return FALL for September, October, and November', () => {
      expect(monthToSeason(8)).toBe(Season.FALL);
      expect(monthToSeason(9)).toBe(Season.FALL);
      expect(monthToSeason(10)).toBe(Season.FALL);
    });
  
    it('should throw an error for invalid month values', () => {
      expect(() => monthToSeason(-1)).toThrow('Month must be between 0 and 11');
      expect(() => monthToSeason(12)).toThrow('Month must be between 0 and 11');
    });
  });