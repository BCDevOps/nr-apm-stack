/**
 * Details about the event’s logging mechanism or logging transport.
 * @see {@link https://www.elastic.co/guide/en/ecs/current/ecs-log.html}
 */
export interface Log {
  file: {
    /**
     * [non-ecs] The offset position in bytes where the message started in the log file
     * @label NON_ECS_NATIVE
     */
    offset?: number;
    /**
     * Full path to the log file this event came from, including the file name.
     * It should include the drive letter, when appropriate.
     * @see {@link https://www.elastic.co/guide/en/ecs/current/ecs-log.html#field-log-file-path}
     */
    path: string;
  };
}
