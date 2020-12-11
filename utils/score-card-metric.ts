export class ScoreCardMetric {
  public lastStatus: ScoreCardMetricStatus = "loading"; // used by consumed for change detection.
  public statusChanged = () => {}; // does nothing, but allows consumers to listen for status change.

  /**
   * Creates a new ScoreCardMetric.
   */
  constructor(
    public readonly name: string,
    public readonly points: number,
    public readonly category: "required" | "recommended" | "optional",
    private readonly getStatus: () => ScoreCardMetricStatus
  ) {
    this.lastStatus = this.getStatus();
  }

  /**
   * Gets the state of the metric.
   */
  get status(): ScoreCardMetricStatus {
    const newStatus = this.getStatus();
    
    // Change detection.
    if (this.lastStatus != newStatus) {
      this.lastStatus = newStatus;
      if (newStatus !== "loading") {
        this.statusChanged();
      }
    }

    return newStatus;
  }
}

export type ScoreCardMetricStatus =
  | "present"
  | "missing"
  | "loading"
  | "unknown";

export interface ScoreCardCheckCompletedEvent {
  score: number;
  meetsRequirements: boolean;
  metrics: ScoreCardMetric[];
}
