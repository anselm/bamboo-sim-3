///
/// An event bus that provides several features to help us marshal object behavior:
///
///		- provides a few hardcoded listeners that do some work for us
///
///		- allows callers to register their own listeners
///
///	Usage is that you throw an object at this event bus, and listeners can perform actions on it
///

const entities = []
const observers = []

export function sys(blob) {

	// step -> if blob has a step property, call onstep on all registered entities
	if(blob.step !== undefined) {
		const daysElapsed = blob.step // For now, assume step is always in days
		entities.forEach(entity => {
			if(entity.onstep) {
				entity.onstep(daysElapsed)
			}
		})
		// Also step observers (like volume service)
		observers.forEach(observer => {
			if(observer.onstep) {
				observer.onstep(daysElapsed)
			}
		})
		return
	}

	// Call all observers with the blob
	observers.forEach(observer => {
		if(observer.onentity) {
			observer.onentity(blob)
		}
	})

	// onreset -> if your object has an onreset() method then call it now
	if(blob.onreset) {
		console.log("sys: resetting ",blob.id)
		blob.onreset()
	}

	// Register entity if it has onstep method
	if(blob.onstep) {
		entities.push(blob)
	}

	// Register observer if it has onentity method
	if(blob.onentity) {
		observers.push(blob)
	}

}

