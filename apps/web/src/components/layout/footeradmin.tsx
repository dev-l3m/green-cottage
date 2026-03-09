export function FooterAdmin() {
  return (
    <footer className="bg-[#244026]">
      <div className="container py-6 text-center text-sm text-white/80">
        <p>
          &copy; {new Date().getFullYear()} Green Cottage. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}