import Head from 'next/head';
import Post from '../components/Post';
import Footer from '../components/Footer';

export default function Home({ posts }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Head>
        <title>Aeeiee WordPress React Demo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center flex-1 px-20 py-10">
        <h1 className="mt-5 mb-5 text-6xl font-bold">Blog</h1>
        <p className="mb-5 text-xl">WordPress as a Headless CMS with React</p>
        {posts && (
          <div className="grid grid-cols-2 gap-5">
            {posts.map((post, id) => {
              return (
                <div key={id}>
                  <div>my post</div>
                  <Post post={post} />
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
