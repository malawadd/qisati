export function ExploreHeader() {
  return (
    <nav className="neo bg-white mx-8 mt-8 p-6">
      <div className="flex items-center justify-between">
        <a href="/" className="font-bold text-xl text-black">ReadOwn</a>
        <div className="flex gap-4">
          <a href="/" className="font-medium text-black hover:text-primary">Home</a>
          <a href="#" className="font-medium text-black hover:text-primary">Docs</a>
        </div>
      </div>
    </nav>
  );
}
