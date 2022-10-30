import fs from 'fs';
import path from 'path';
import { createCanvas, registerFont, loadImage } from 'canvas';

const size = { width: 1200 , height: 630 };
const current = process.cwd();

type TypeOrganizer = {
	id: string
	type: string
	name: string
	title: string
	url: string
	twitter: string
	github: string
	facebook: string
	linkedin: string
	profile_ja: string
	company: string
}

export const generateOgImage = async (organizer: TypeOrganizer): Promise<Buffer> => {
  // font を登録
  const font = path.resolve(current, 'fonts/NotoSansJP-Bold.otf');
  registerFont(font, { family: 'NotoSansJP' });

  // canvas を作成
  const { width, height } = size;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 元になる画像を読み込む
  const src = path.resolve(current, 'image/ogp-template.jpg');
  const image = await loadImage(fs.readFileSync(src));
  // 元の画像を canvas にセットする
  ctx.drawImage(image, 0, 0, width, height);
	ctx.save();
	ctx.scale(1, 1);
	const imageSize = 400;
  const circle = imageSize/2;
  ctx.arc(width / 2, height / 2, circle, 0, Math.PI*2, false);
  ctx.clip();
	const imageSrc = path.resolve(current, `image/organizers/${organizer.id}.jpg`);
	const person = await loadImage(fs.readFileSync(imageSrc));
	ctx.drawImage(person, 0, 0, imageSize, imageSize, width / 2 - imageSize / 2, height / 2 - imageSize / 2, imageSize, imageSize);
  ctx.restore();
	ctx.beginPath();
  ctx.fillStyle = "rgb(60,60,60)";
	const boxWidth = 600;
  ctx.fillRect(width / 2 - boxWidth / 2, 410, boxWidth, 110);
  ctx.closePath();

	ctx.font = "30px 'NotoSansJP'";
  ctx.fillStyle = "rgb(255,255,255)";
	ctx.beginPath();
  const textWidth = ctx.measureText( organizer.name ).width;
  ctx.fillText(organizer.name, width / 2 - textWidth / 2, 455);
	const title = getTitle(organizer);
  let companyWidth = ctx.measureText( title ).width;
	if (companyWidth > 700) {
		ctx.font = "20px 'NotoSansJP'";
		companyWidth = ctx.measureText( title ).width;
	}
  ctx.fillText(title, width / 2 - companyWidth / 2, 495);
	return canvas.toBuffer();
}

const getTitle = (organizer: TypeOrganizer): string => {
	if (organizer.title !== '' && organizer.company !== '') {
		return `${organizer.title}@${organizer.company}`;
	}
	if (organizer.title !== '') {
		return organizer.title;
	}
	return organizer.company;
}

const organizers = require('./_data/organizers.json');

(async () => {
	organizers.forEach(async (organizer: any) => {
		if (organizer.type === 'member') {
			const img = await generateOgImage(organizer);
			fs.writeFileSync(path.resolve(current, 'image/ogp', `${organizer.id}.jpg`), img);
		}
	});
})();