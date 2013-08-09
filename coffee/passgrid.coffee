class Point
	constructor: (@x, @y, @cell) ->
	stringy: -> "(#{this.x}, #{this.y})"

class Pattern
	constructor: ->
		this.points = []

	addPoint: (point) ->
		for p of this.points
			if p.x is point.x and p.y is point.y
				return
		this.points = [this.points..., point]

	toHash: ->
		if CryptoJS.SHA3?
			stringify = ""
			for p in this.points
				stringify += p.stringy()
			CryptoJS.SHA3(stringify)

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
			points = [points..., new Point(i, j, td)]
			j++
		i++

	for point in points
		if jQuery?
			jQuery(point.cell).click(
				(eventObject) ->
					if this.innerHTML is ""
						password.addPoint(point)
						this.innerHTML = password.points.length
						this.className += " active"
			)
		else
			point.cell.onclick = 
				(eventObject) ->
					if this.innerHTML is ""
						password.addPoint(point)
						this.innerHTML = password.points.length
						this.className += " active"

	return table