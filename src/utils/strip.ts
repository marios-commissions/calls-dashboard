function strip(content: string, character: string = '*', length: number = 28) {
	return content.slice(0, length) + character.repeat(content.length).slice(length);
}

export default strip;