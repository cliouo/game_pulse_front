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
  collected_at: string;
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
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED';
export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface TaskParameters {
  [key: string]: unknown;
}

export interface TaskExecution {
  id: number;
  task_id: number;
  status: TaskStatus;
  started_at: string;
  completed_at: string;
  duration: number;
  error_message?: string;
  result?: Record<string, unknown>;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
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
  is_running: boolean;
  uptime: number;
  active_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
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
