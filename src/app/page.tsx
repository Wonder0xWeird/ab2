export default function Home() {
  return (
    <div
      className="h-screen flex items-center justify-center bg-dark-exa"
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("/images/art/dark-exa.png")'
      }}
    >
      <div className="text-center" style={{ textAlign: 'center' }}>
        <div
          className="text-[10rem] font-crimson text-gold mb-[-2rem]"
          style={{
            fontSize: '10rem',
            fontFamily: 'Crimson Text, Georgia, serif',
            color: '#cc9c42',
            marginBottom: '-2rem'
          }}
        >
          A
        </div>
        <h1
          className="text-6xl font-bold text-gold font-crimson"
          style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: '#cc9c42',
            fontFamily: 'Crimson Text, Georgia, serif'
          }}
        >
          ABSTRACTU
        </h1>
        <p
          className="mt-6 text-xl text-foreground"
          style={{
            marginTop: '1.5rem',
            fontSize: '1.25rem',
            color: '#e0e0e0'
          }}
        >
          Abstraction to abstraction, Ab2 is.
        </p>
      </div>
    </div>
  );
}
