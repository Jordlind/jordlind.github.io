export type Locale = 'sv' | 'en';

export const locales: Locale[] = ['sv', 'en'];
export const defaultLocale: Locale = 'sv';

type Dict = Record<string, string>;

export const translations: Record<Locale, Dict> = {
	sv: {
		'nav.home': 'Hem',
		'nav.beers': 'Våra öl',
		'nav.about': 'Om oss',
		'nav.brand': 'Jordlind',
		'nav.tagline': 'Hantverksbryggeri',

		'home.heroTitle': 'Jordnära öl, bryggt med tålamod',
		'home.heroText':
			'Jordlind är ett litet familjebryggeri – en svärson och en svärfar som brygger öl vi själva vill dricka. Ärligt, smakrikt och gjort i små satser, med fötterna stadigt i jorden.',
		'home.cta': 'Se våra öl',
		'home.latestTitle': 'Senaste bryggderna',
		'home.latestText': 'Ett urval av det vi har på lager just nu.',
		'home.aboutCta': 'Läs mer om oss',

		'beers.title': 'Våra öl',
		'beers.intro': 'Varje öl bryggs i små satser. Klicka på ett öl för att se receptet.',
		'beers.empty': 'Inga öl ännu – håll utkik!',
		'beers.viewRecipe': 'Visa recept',

		'beer.recipe': 'Recept',
		'beer.details': 'Detaljer',
		'beer.abv': 'Alkoholhalt',
		'beer.ibu': 'Beska (IBU)',
		'beer.ebc': 'Färg (EBC)',
		'beer.og': 'OG',
		'beer.fg': 'FG',
		'beer.style': 'Stil',
		'beer.brewed': 'Bryggdatum',
		'beer.back': 'Tillbaka till alla öl',
		'beer.available': 'Tillgänglig',
		'beer.soldOut': 'Slut',
		'beer.noTranslation': 'Det här innehållet finns ännu inte på svenska.',

		'about.title': 'Om Jordlind',

		'footer.rights': 'Bryggt med kärlek. Drick ansvarsfullt.'
	},
	en: {
		'nav.home': 'Home',
		'nav.beers': 'Our Beers',
		'nav.about': 'About',
		'nav.brand': 'Jordlind',
		'nav.tagline': 'Craft Brewery',

		'home.heroTitle': 'Down-to-earth beer, brewed with patience',
		'home.heroText':
			'Jordlind is a small family brewery — a son-in-law and a father-in-law brewing the beer we want to drink. Honest, flavourful, made in small batches, with our feet firmly on the ground.',
		'home.cta': 'Browse our beers',
		'home.latestTitle': 'Latest brews',
		'home.latestText': 'A selection of what we have on hand right now.',
		'home.aboutCta': 'Learn more about us',

		'beers.title': 'Our Beers',
		'beers.intro': 'Every beer is brewed in small batches. Click a beer to see its recipe.',
		'beers.empty': 'No beers yet — stay tuned!',
		'beers.viewRecipe': 'View recipe',

		'beer.recipe': 'Recipe',
		'beer.details': 'Details',
		'beer.abv': 'ABV',
		'beer.ibu': 'Bitterness (IBU)',
		'beer.ebc': 'Colour (EBC)',
		'beer.og': 'OG',
		'beer.fg': 'FG',
		'beer.style': 'Style',
		'beer.brewed': 'Brew date',
		'beer.back': 'Back to all beers',
		'beer.available': 'Available',
		'beer.soldOut': 'Sold out',
		'beer.noTranslation': 'This content is not available in English yet.',

		'about.title': 'About Jordlind',

		'footer.rights': 'Brewed with love. Please drink responsibly.'
	}
};
