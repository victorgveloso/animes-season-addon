import { TitleType } from "name-to-imdb";

export enum Season {
    WINTER = "WINTER", // December to February
    SPRING = "SPRING", // March to May
    SUMMER = "SUMMER", // June to August
    FALL = "FALL" // September to November
}
export enum Sorting {
    ID = "ID",
    ID_DESC = "ID_DESC",
    TITLE_ROMAJI = "TITLE_ROMAJI",
    TITLE_ROMAJI_DESC = "TITLE_ROMAJI_DESC",
    TITLE_ENGLISH = "TITLE_ENGLISH",
    TITLE_ENGLISH_DESC = "TITLE_ENGLISH_DESC",
    TITLE_NATIVE = "TITLE_NATIVE",
    TITLE_NATIVE_DESC = "TITLE_NATIVE_DESC",
    TYPE = "TYPE",
    TYPE_DESC = "TYPE_DESC",
    FORMAT = "FORMAT",
    FORMAT_DESC = "FORMAT_DESC",
    START_DATE = "START_DATE",
    START_DATE_DESC = "START_DATE_DESC",
    END_DATE = "END_DATE",
    END_DATE_DESC = "END_DATE_DESC",
    SCORE = "SCORE",
    SCORE_DESC = "SCORE_DESC",
    POPULARITY = "POPULARITY",
    POPULARITY_DESC = "POPULARITY_DESC",
    TRENDING = "TRENDING",
    TRENDING_DESC = "TRENDING_DESC",
    EPISODES = "EPISODES",
    EPISODES_DESC = "EPISODES_DESC",
    DURATION = "DURATION",
    DURATION_DESC = "DURATION_DESC",
    STATUS = "STATUS",
    STATUS_DESC = "STATUS_DESC",
    CHAPTERS = "CHAPTERS",
    CHAPTERS_DESC = "CHAPTERS_DESC",
    VOLUMES = "VOLUMES",
    VOLUMES_DESC = "VOLUMES_DESC",
    UPDATED_AT = "UPDATED_AT",
    UPDATED_AT_DESC = "UPDATED_AT_DESC",
    SEARCH_MATCH = "SEARCH_MATCH",
    FAVOURITES = "FAVOURITES",
    FAVOURITES_DESC = ""
}

/**
 * Convert month to season
 * @param month Month must be between 0 and 11
 */
export function monthToSeason(month: number): Season {
    if (new Set<number>([11,0,1]).has(month)) return Season.WINTER;
    if (month >= 2 && month <= 4) return Season.SPRING;
    if (month >= 5 && month <= 7) return Season.SUMMER;
    if (month >= 8 && month <= 10) return Season.FALL;
    throw new Error("Month must be between 0 and 11");
}

/**
 * Create a sorted list of seasons based on the first season provided
 * @param firstSeason current season of the year that should be first in the list of seasons
 * @returns Sorted list of seasons with the first season being the one passed as argument
 */
export function createSortedSeasonList(firstSeason: Season): Season[] {
  switch (firstSeason) {
    case Season.WINTER:
      return [Season.WINTER, Season.SPRING, Season.SUMMER, Season.FALL];
    case Season.SPRING:
      return [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER];
    case Season.SUMMER:
      return [Season.SUMMER, Season.FALL, Season.WINTER, Season.SPRING];
    case Season.FALL:
      return [Season.FALL, Season.WINTER, Season.SPRING, Season.SUMMER];
    default:
      throw new Error("Invalid season");
  }
}

/**
 * Generate query string for GraphQL based on template and arguments
 * @param year Queried year
 * @param season Queried season
 * @param sorting Sorting algorithm
 * @returns The query string
 */
export function query(year: number, season: Season, sorting: Sorting, format: TitleType = "movie"): string{
    if (year < 2000 || year > (new Date()).getFullYear()) throw new Error("Year must be between 2000 and now");
    const formatFilter = format === "movie" ? "format:MOVIE" : "format_in:[TV,TV_SHORT,OVA,SPECIAL,ONA]";
    return `query {
        Page(perPage: 50, page: 1) {
          media(seasonYear:${year}, season:${season}, sort:${sorting}, type:ANIME, ${formatFilter}) {
            title {
              romaji
              english
            }
            description
            seasonYear
            bannerImage
            coverImage {
              medium
              large
              extraLarge
            }
          }
        }
      }`
}