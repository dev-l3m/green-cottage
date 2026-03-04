import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Nos offres | L3M Green Cottage',
  description: 'Découvrez nos offres de gîtes et hébergements nature.',
};

export default function TarifsPage() {
  redirect('/cottages');
}
