export const extraSymbols: {
	emoji: string;
	description: string;
	category: string;
	aliases: string[];
	tags: string[];
}[] = [
	// Arrows — text arrows, distinct from emoji ⬅️➡️ etc.
	s("←", "left arrow", "Arrows", ["arrow_left", "leftwards"], ["arrow", "left"]),
	s("→", "right arrow", "Arrows", ["arrow_right", "rightwards"], ["arrow", "right"]),
	s("↑", "up arrow", "Arrows", ["arrow_up", "upwards"], ["arrow", "up"]),
	s("↓", "down arrow", "Arrows", ["arrow_down", "downwards"], ["arrow", "down"]),
	s("↔", "left right arrow", "Arrows", ["arrow_left_right"], ["arrow", "horizontal"]),
	s("↕", "up down arrow", "Arrows", ["arrow_up_down"], ["arrow", "vertical"]),
	s("↖", "up left arrow", "Arrows", ["arrow_upper_left"], ["arrow", "northwest"]),
	s("↗", "up right arrow", "Arrows", ["arrow_upper_right"], ["arrow", "northeast"]),
	s("↘", "down right arrow", "Arrows", ["arrow_lower_right"], ["arrow", "southeast"]),
	s("↙", "down left arrow", "Arrows", ["arrow_lower_left"], ["arrow", "southwest"]),

	// List / bullet characters
	s("•", "bullet", "Bullets", ["bullet", "dot"], ["bullet", "dot", "list"]),
	s("·", "middle dot", "Bullets", ["interpunct", "middot"], ["bullet", "dot", "list"]),
	s("‣", "triangular bullet", "Bullets", ["triangle_bullet"], ["bullet", "list", "triangle"]),
	s("⁃", "hyphen bullet", "Bullets", ["hyphen_bullet"], ["bullet", "list", "hyphen"]),
	s("◦", "white bullet", "Bullets", ["white_bullet"], ["bullet", "list", "circle"]),
	s("▪", "black small square", "Bullets", ["small_square"], ["bullet", "square", "list"]),
	s("▫", "white small square", "Bullets", ["small_white_square"], ["bullet", "square", "list"]),
	s("▸", "black small triangle", "Bullets", ["small_triangle"], ["bullet", "triangle", "list", "play"]),
	s("▹", "white small triangle", "Bullets", ["small_white_triangle"], ["bullet", "triangle", "list"]),
	s("►", "black pointer", "Bullets", ["pointer"], ["bullet", "triangle", "play"]),
	s("●", "black circle", "Bullets", ["black_circle_symbol"], ["bullet", "circle", "dot"]),
	s("○", "white circle", "Bullets", ["white_circle_symbol"], ["bullet", "circle"]),
	s("◆", "black diamond", "Bullets", ["black_diamond_symbol"], ["bullet", "diamond"]),
	s("■", "black square", "Bullets", ["black_square_symbol"], ["bullet", "square"]),
	s("□", "white square", "Bullets", ["white_square_symbol"], ["bullet", "square"]),

	// Currency
	s("¢", "cent", "Currency", ["cent"], ["currency", "cent"]),
	s("£", "pound sterling", "Currency", ["gbp", "pound"], ["currency", "pound", "britain"]),
	s("¤", "currency sign", "Currency", ["currency_sign"], ["currency", "generic"]),
	s("¥", "yen", "Currency", ["jpy", "yuan", "yen"], ["currency", "yen", "yuan", "japan", "china"]),
	s("€", "euro", "Currency", ["eur", "euro"], ["currency", "euro", "europe"]),
	s("₹", "indian rupee", "Currency", ["inr", "rupee"], ["currency", "rupee", "india"]),
	s("₽", "ruble", "Currency", ["rub", "ruble"], ["currency", "ruble", "russia"]),
	s("₩", "won", "Currency", ["krw", "won"], ["currency", "won", "korea"]),
	s("₪", "shekel", "Currency", ["ils", "shekel"], ["currency", "shekel", "israel"]),
	s("₫", "dong", "Currency", ["vnd", "dong"], ["currency", "dong", "vietnam"]),
	s("₱", "peso", "Currency", ["php", "peso"], ["currency", "peso", "philippines"]),
	s("₦", "naira", "Currency", ["ngn", "naira"], ["currency", "naira", "nigeria"]),
	s("₴", "hryvnia", "Currency", ["uah", "hryvnia"], ["currency", "hryvnia", "ukraine"]),
	s("₿", "bitcoin", "Currency", ["btc", "bitcoin"], ["currency", "bitcoin", "crypto"]),
	s("฿", "baht", "Currency", ["thb", "baht"], ["currency", "baht", "thailand"]),
	s("₡", "colon", "Currency", ["crc", "colon"], ["currency", "colon", "costa"]),
	s("₣", "franc", "Currency", ["franc"], ["currency", "franc"]),
	s("₨", "rupee", "Currency", ["rupee_sign"], ["currency", "rupee"]),
	s("₭", "kip", "Currency", ["lak", "kip"], ["currency", "kip", "laos"]),
	s("₵", "cedi", "Currency", ["ghs", "cedi"], ["currency", "cedi", "ghana"]),
	s("₸", "tenge", "Currency", ["kzt", "tenge"], ["currency", "tenge", "kazakhstan"]),
	s("₺", "lira", "Currency", ["try", "lira"], ["currency", "lira", "turkey"]),
	s("₼", "manat", "Currency", ["azn", "manat"], ["currency", "manat"]),
	s("₾", "lari", "Currency", ["gel", "lari"], ["currency", "lari", "georgia"]),

	// Math & comparison
	s("°", "degree", "Math", ["degree"], ["math", "degree", "temperature"]),
	s("±", "plus minus", "Math", ["plus_minus"], ["math", "plus", "minus"]),
	s("×", "multiplication", "Math", ["multiply", "times"], ["math", "multiply"]),
	s("÷", "division", "Math", ["divide"], ["math", "divide"]),
	s("≈", "almost equal", "Math", ["approx", "approximately"], ["math", "equal", "approx"]),
	s("≠", "not equal", "Math", ["not_equal", "ne"], ["math", "equal"]),
	s("≤", "less than or equal", "Math", ["lte", "leq"], ["math", "less", "equal"]),
	s("≥", "greater than or equal", "Math", ["gte", "geq"], ["math", "greater", "equal"]),
	s("∞", "infinity", "Math", ["infinity"], ["math", "infinity"]),
	s("√", "square root", "Math", ["sqrt", "root"], ["math", "root"]),
	s("∑", "summation", "Math", ["sum", "sigma"], ["math", "sum"]),
	s("π", "pi", "Math", ["pi"], ["math", "pi"]),
	s("µ", "micro", "Math", ["micro", "mu"], ["math", "micro"]),
	s("∂", "partial differential", "Math", ["partial"], ["math", "partial"]),
	s("∆", "increment", "Math", ["delta"], ["math", "delta"]),
	s("∅", "empty set", "Math", ["emptyset", "empty"], ["math", "empty", "null"]),
	s("½", "one half", "Math", ["one_half", "half"], ["math", "fraction", "half"]),
	s("⅓", "one third", "Math", ["one_third"], ["math", "fraction", "third"]),
	s("⅔", "two thirds", "Math", ["two_thirds"], ["math", "fraction", "third"]),
	s("¼", "one quarter", "Math", ["one_quarter", "quarter"], ["math", "fraction", "quarter"]),
	s("¾", "three quarters", "Math", ["three_quarters"], ["math", "fraction", "quarter"]),

	// Typography
	s("–", "en dash", "Typography", ["en_dash", "ndash"], ["dash", "en", "range"]),
	s("—", "em dash", "Typography", ["em_dash", "mdash"], ["dash", "em"]),
	s("…", "ellipsis", "Typography", ["ellipsis", "dots"], ["ellipsis", "dots"]),
	s("‘", "left single quote", "Typography", ["quote_left_single"], ["quote", "single"]),
	s("’", "right single quote", "Typography", ["quote_right_single", "apostrophe"], ["quote", "single", "apostrophe"]),
	s("“", "left double quote", "Typography", ["quote_left_double"], ["quote", "double"]),
	s("”", "right double quote", "Typography", ["quote_right_double"], ["quote", "double"]),
	s("«", "left guillemet", "Typography", ["guillemet_left"], ["quote", "guillemet"]),
	s("»", "right guillemet", "Typography", ["guillemet_right"], ["quote", "guillemet"]),
	s("§", "section", "Typography", ["section", "silcrow"], ["section", "legal"]),
	s("¶", "pilcrow", "Typography", ["pilcrow", "paragraph"], ["paragraph", "pilcrow"]),
	s("†", "dagger", "Typography", ["dagger"], ["dagger", "footnote"]),
	s("‡", "double dagger", "Typography", ["double_dagger"], ["dagger", "footnote"]),
	s("‰", "per mille", "Typography", ["permille", "per_mille"], ["percent", "permille"]),

	// Marks & checkboxes
	s("©", "copyright", "Symbols", ["copyright"], ["copyright", "legal"]),
	s("®", "registered", "Symbols", ["registered"], ["registered", "legal"]),
	s("✓", "check mark", "Symbols", ["check", "checkmark"], ["check", "tick", "yes"]),
	s("✔", "heavy check mark", "Symbols", ["heavy_check"], ["check", "tick", "yes"]),
	s("✗", "ballot x", "Symbols", ["x_mark", "cross"], ["x", "cross", "no"]),
	s("☐", "ballot box", "Symbols", ["checkbox", "unchecked"], ["box", "checkbox", "todo"]),
	s("☑", "ballot box with check", "Symbols", ["checkbox_checked"], ["box", "checkbox", "check", "todo"]),
	s("☒", "ballot box with x", "Symbols", ["checkbox_x"], ["box", "checkbox", "x", "todo"]),
	s("⌫", "delete", "Symbols", ["backspace", "delete"], ["delete", "backspace", "keyboard"]),
];

function s(
	emoji: string,
	description: string,
	category: string,
	aliases: string[],
	tags: string[],
) {
	return { emoji, description, category, aliases, tags };
}
