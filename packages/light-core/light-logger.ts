// Placeholder for a structured logger.
export function logLightEvent(event: any) {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), lightEvent: event }));
}
