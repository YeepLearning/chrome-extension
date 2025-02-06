const DEV_SERVER = 'http://localhost:3000'

export async function log(event: string, data: any = {}) {
    try {
        console.log('Logging event:', event, data)
        const response = await fetch(`${DEV_SERVER}/api/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event,
                data
            })
        })

        if (!response.ok) {
            console.error('Failed to log event:', event)
        }
    } catch (error) {
        console.error('Error logging event:', error)
    }
} 