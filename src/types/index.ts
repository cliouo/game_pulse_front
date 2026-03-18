import type { ExtendedJSONSchema, UISchema } from './schema';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface PublisherDashboardStats {
  total_games: number;
  coming_soon_games: number;
  high_potential_games: number;
  medium_potential_games: number;
  low_risk_games: number;
  medium_risk_games: number;
  high_risk_games: number;
  last_update_time: string;
}

export interface PotentialGameScore {
  id: number;
  app_id: number;
  name: string;
  header_image: string;
  store_url: string;
  type: string;
  developers: string;
  publishers: string;
  release_date: string;
  coming_soon: boolean;
  price: number;
  discount_percent: number;
  followers: number;
  current_players: number;
  review_score: number;
  review_count: number;
  review_positive: number;
  review_negative: number;
  wishlist_rank: number;
  selling_rank: number;
  potential_score: number;
  follower_potential: number;
  market_potential: number;
  wishlist_potential: number;
  review_potential: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  investment_category: 'INDIE' | 'MID_BUDGET' | 'AAA';
  created_at: string;
}

export interface MarketOpportunity {
  title: string;
  description: string;
  category: string;
  opportunity_score: number;
  risk_level: string;
  time_window: string;
  examples: PotentialGameScore[];
}

export interface RankingRecord {
  id: number;
  app_id: number;
  name: string;
  header_image?: string;
  rank_order: number;
  record_time: string;
  created_at: string;
  updated_at: string;
}

export interface TopGameInfo {
  id: number;
  game_id: number;
  app_id: number;
  game_name: string;
  header_image: string;
  current_players: number;
  followers: number;
  price: number;
  discount_percent: number;
  review_score: number;
  review_count: number;
  review_positive: number;
  review_negative: number;
  wishlist_rank: number;
  selling_rank: number;
  collected_at: number;
}

export interface GameWithStats {
  id: number;
  app_id: number;
  name: string;
  alias: string;
  header_image: string;
  store_url: string;
  offcial_website: string;
  type: string;
  developers: string;
  publishers: string;
  categories: string;
  keywords: string;
  short_description: string;
  release_date: string;
  coming_soon: boolean;
  is_free: boolean;
  price: number;
  discount_percent: number;
  status: number;
  expiration_date: string;
  is_expired: boolean;
  support_info: string;
  current_players: number;
  player_peak: number;
  followers: number;
  follower_peak: number;
  review_score: number;
  review_count: number;
  review_positive: number;
  review_negative: number;
  wishlist_rank: number;
  selling_rank: number;
  stats_collected_at: string;
  created_at: string;
}

export interface GamesQueryParams {
  page?: number;
  page_size?: number;
  name?: string;
  status?: number;
  type?: string;
  release_status?: 'released' | 'coming_soon' | 'all';
  with_stats?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  expiration_status?: 'active' | 'expired' | 'all';
}

export interface PotentialGamesQueryParams {
  release_status?: 'all' | 'released' | 'coming_soon';
  min_potential_score?: number;
  max_potential_score?: number;
  risk_levels?: string;
  investment_categories?: string;
  min_followers?: number;
  max_followers?: number;
  min_review_score?: number;
  max_review_score?: number;
  min_review_count?: number;
  max_price?: number;
  has_discount?: boolean;
  sort_by?:
    | 'potential_score'
    | 'wishlist_rank'
    | 'followers'
    | 'review_score'
    | 'price'
    | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface GameTrendPoint {
  date: string;
  current_players: number;
  followers: number;
  review_score: number;
  review_count: number;
  wishlist_rank: number;
  selling_rank: number;
}

export interface GameTrendData {
  app_id: number;
  name: string;
  trends: GameTrendPoint[];
}

export interface PublisherRecommendation {
  id: number;
  title: string;
  description: string;
  category: string;
  recommendation_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  related_games?: PotentialGameScore[];
  created_at: string;
}

// 任务类型
export type TaskType = 'FETCH_RANKINGS' | 'FETCH_STATS' | 'CLEANUP' | 'SYNC';

export interface TaskTypeOption {
  value: string;
  label: string;
  description: string;
  schema: ExtendedJSONSchema;
  ui_schema: UISchema;
  parameters?: Record<string, unknown>;
}
export type TaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

// Crawl Scope types
export interface SystemSetting {
  key: string;
  value: string;
  category: string;
  label: string;
  updated_at: string;
}

export interface CrawlScopeConfig {
  whitelist_enabled: boolean;
  whitelist_app_ids: number[];
  ranking_max_entries: number;
  steam_ranking_max_count: number;
  per_game_limit: number;
  disabled_task_types: string[];
}

export interface WhitelistGame {
  app_id: number;
  name: string;
  header_image?: string;
}

export interface TaskParameters {
  [key: string]: unknown;
}

export interface TaskExecutionStep {
  id: number;
  execution_id: number;
  step: string;
  status: TaskStatus;
  started_at?: number;
  finished_at?: number;
  duration?: number;
  processed?: number;
  succeeded?: number;
  failed?: number;
  output?: string;
  error_message?: string;
}

export interface TaskExecutionLog {
  id: number;
  execution_id: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  step?: string;
  context?: string;
  created_at: number;
}

export interface TaskExecution {
  id: number;
  task_id: number;
  status: TaskStatus;
  started_at: string;
  completed_at: string;
  duration: number;
  trace_id?: string;
  log_count?: number;
  error_message?: string;
  result?: Record<string, unknown>;
  processed_count?: number;
  success_count?: number;
  failed_count?: number;
  output?: string;
  steps?: TaskExecutionStep[];
}

export interface Task {
  id: number;
  name: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  last_run_at?: number;
  last_run_status?: TaskStatus;
  priority: TaskPriority;
  enabled: boolean;
  cron_expression: string;
  timeout: number;
  max_retries: number;
  retry_interval: number;
  concurrency: number;
  single_run: boolean;
  parameters: TaskParameters;
  next_run_at: string;
  executions?: TaskExecution[];
  created_at: string;
  updated_at: string;
}

export interface TaskStats {
  task_id: number;
  task_name: string;
  task_type: string;
  total_runs: number;
  success_runs: number;
  failed_runs: number;
  success_rate: number;
  avg_duration: number;
  last_run_time: string;
  last_run_status: string;
}

export interface SchedulerStatus {
  enabled: boolean;
  uptime: number;
  start_time?: string;
  timezone?: string;
  tasks?: Record<string, {
    id: number;
    name: string;
    cron_expression: string;
    enabled: boolean;
    exists: boolean;
  }>;
}

// Admin 查询参数
export interface AdminTasksQueryParams {
  page?: number;
  page_size?: number;
  type?: string;
  status?: string;
  enabled?: boolean;
  priority?: string;
}

// SteamDB 元数据类型
export interface SteamTagInfo {
  tag_name: string;
  votes: number;
}

export interface SteamMostFollowedInfo {
  app_id: number;
  name: string;
  rank: number;
  follower_count: number;
  recorded_at: number;
}

export interface SteamTopRatedInfo {
  app_id: number;
  name: string;
  rank: number;
  rating: number;
  votes: number;
  recorded_at: number;
}

export interface SteamMostWishlistedInfo {
  app_id: number;
  name: string;
  rank: number;
  follow_count: number;
  seven_day_gain: number;
  recorded_at: number;
}

export interface SteamMostPlayedInfo {
  app_id: number;
  name: string;
  rank: number;
  current_players: number;
  peak_today: number;
  recorded_at: number;
}

export interface SteamSaleInfo {
  app_id: number;
  name: string;
  original_price: number;
  sale_price: number;
  discount_percent: number;
  currency: string;
  detected_at: number;
}

export interface SteamNewsItem {
  id: number;
  app_id: number;
  gid: string;
  title: string;
  url: string;
  author: string;
  contents: string;
  feed_label: string;
  feed_name: string;
  published_at: number;
}

export interface SteamReviewItem {
  id: number;
  app_id: number;
  recommendation_id: string;
  author_steam_id: string;
  playtime_forever: number;
  voted_up: boolean;
  votes_up: number;
  votes_funny: number;
  language: string;
  review_text: string;
  review_created_at: number;
}

export interface SteamSpyInfo {
  id: number;
  app_id: number;
  owners_min: number;
  owners_max: number;
  average_playtime: number;
  median_playtime: number;
  ccu: number;
  score_rank: string;
  positive: number;
  negative: number;
  collected_at: number;
}

export interface IGDBGameInfo {
  app_id: number;
  igdb_id: number;
  aggregated_rating?: number;
  rating?: number;
  similar_games_json?: string;
  genres_json?: string;
  themes_json?: string;
  cover_url?: string;
}

export interface GameDealInfo {
  id: number;
  app_id: number;
  name?: string;
  store: string;
  current_price: number;
  regular_price: number;
  currency: string;
  discount_percent: number;
  historical_low: number;
  historical_low_at?: number;
  url: string;
  collected_at: number;
}

export interface HLTBInfo {
  app_id: number;
  hltb_id: number;
  main_story_hours?: number;
  main_extra_hours?: number;
  completionist_hours?: number;
  all_styles_hours?: number;
}

// Steam History 类型
export interface PlayerHistoryPoint {
  player_count: number;
  recorded_at: number;
}

export interface PriceHistoryPoint {
  price: number;
  discount_percent: number;
  currency: string;
  recorded_at: number;
}

export interface FollowerHistoryPoint {
  follower_count: number;
  recorded_at: number;
}

export interface HistoryQueryParams {
  page?: number;
  page_size?: number;
  start_time?: string;
  end_time?: string;
}

// 游戏详情（增强版，包含 SteamDB 字段）
export interface GameDetail {
  id: number;
  app_id: number;
  name: string;
  type: string;
  header_image: string;
  alias: string;
  short_description: string;
  developers: string;
  publishers: string;
  release_date: string;
  is_free: boolean;
  coming_soon: boolean;
  status: number;
  store_url: string;
  offcial_website: string;
  categories: string;
  keywords: string;
  support_info: string;
  follower_count: number | null;
  follower_peak: number | null;
  player_peak: number | null;
  dlc_count: number | null;
  achievement_count: number | null;
  steamdb_synced: boolean;
  platforms?: string;
  metacritic_score?: number;
  metacritic_url?: string;
  screenshots_json?: string;
  movies_json?: string;
  supported_languages?: string;
  required_age?: number;
  about_the_game?: string;
  pc_requirements?: string;
  recommendations?: number;
  protondb_tier?: string;
  protondb_score?: number;
  created_at: number;
}

// 最新统计数据
export interface StatsDetail {
  id: number;
  game_id: number;
  game_name: string;
  app_id: number;
  followers: number;
  current_players: number;
  review_score: number;
  review_score_desc: string;
  review_count: number;
  review_positive: number;
  review_negative: number;
  price: number;
  discount_percent: number;
  wishlist_rank: number;
  selling_rank: number;
  collected_at: number;
  collection_period: string;
}

// 爬虫执行日志
export interface CrawlLogEntry {
  elapsed_seconds: number;
  level: string;
  message: string;
}

export interface CrawlExecutionDetail {
  id: number;
  execution_id: number;
  trace_id: string;
  endpoint: string;
  app_id: number;
  session_id: string;
  proxy_used: string;
  attempt_count: number;
  total_elapsed_s: number;
  success: boolean;
  status_code: number;
  exception_type: string;
  exception_msg: string;
  cf_challenge: boolean;
  cf_solve_time_s: number;
  logs: string;
  created_at: string;
}

export interface CrawlLogsQueryParams {
  execution_id?: number;
  app_id?: number;
  success?: string;
  endpoint?: string;
  page?: number;
  page_size?: number;
}
