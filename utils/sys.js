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

export function sys(blob) {

	// step -> if blob has a step property, call onstep on all registered entities
	if(blob.step !== undefined) {
		const daysElapsed = blob.step // For now, assume step is always in days
		entities.forEach(entity => {
			if(entity.onstep) {
				entity.onstep(daysElapsed)
			}
		})
		return
	}

	// onreset -> if your object has an onreset() method then call it now
	if(blob.onreset) {
		console.log("sys: resetting ",blob.id)
		blob.onreset()
	}

	// Register entity if it has onstep method
	if(blob.onstep) {
		entities.push(blob)
	}

}

