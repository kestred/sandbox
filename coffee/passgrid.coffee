class Point
	constructor: (@x, @y, @cell) ->
		this.cell.key = this
	toString: -> "Point(#{this.x}, #{this.y})"
	stringy: -> "#{this.x},#{this.y}"

class Pattern
	constructor: ->
		this.points = []

	addPoint: (point) ->
		for p of this.points
			if p.x is point.x and p.y is point.y
				return
		this.points = [this.points..., point]

	toHash: (stringToHash) ->
		stringify = this.points[0].stringy()
		for p in this.points[1..]
			stringify += '|' + p.stringy()

		return stringToHash(stringify)

	toString: ->
		stringify = this.points[0].toString()
		for p in this.points[1..]
			stringify += ", " + p.toString()
		return stringify

window.PasswordGrid = (width, height) ->
	points = []
	password = new Pattern()

	table = document.createElement("table")
	table.className = "passgrid"
	table.pattern = password

	i = 0
	while i < height
		tr = table.insertRow(-1)

		j = 0
		while j < width
			td = tr.insertCell(-1)
			points = [points..., new Point(j, i, td)]
			j++
		i++

	for point in points
		if jQuery?
			jQuery(point.cell).click(
				(eventObject) ->
					if this.innerHTML is ""
						password.addPoint(this.key)
						this.innerHTML = password.points.length
						this.className += " active"
			)
		else
			point.cell.onclick = 
				(eventObject) ->
					if this.innerHTML is ""
						password.addPoint(this.key)
						this.innerHTML = password.points.length
						this.className += " active"

	return table