///
/// An event bus that provides several features to help us marshal object behavior:
///
///		- provides a few hardcoded listeners that do some work for us
///
///		- allows callers to register their own listeners
///
///	Usage is that you throw an object at this event bus, and listeners can perform actions on it
///

const ontick = []

export function sys(blob) {

	// onreset -> if your object has an onreset() method then call it now

	if(blob.onreset) {
		blob.onreset()
	}

	// ontick -> if your object has an ontick() method then stash it in a list

	if(blob.ontick) {
		ontick.push(blob)
	}

	// tick -> call all objects that have ontick

	if(blob.tick) {
		ontick.forEach(item=>{item.ontick()})
	}

}

