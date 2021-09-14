import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


import { RiCalendarLine } from 'react-icons/ri'
import { MdPersonOutline } from 'react-icons/md'
import Header from '../components/Header';
import Link from 'next/link';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ results, next_page }: PostPagination) {
  console.log(results)
  return (
    <>
      <main className={styles.container}>
        <div className={styles.posts}>
          <Header />
          {

            results.map(post => (
              <Link key={post.uid}  href={`/post/${post.uid}`}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.info}>
                    <time> <RiCalendarLine className={styles.logoTipo} /> {post.first_publication_date}</time>
                    <span> <MdPersonOutline className={styles.logoTipo} /> {post.data.author}</span>
                  </div>
                </a>
              </Link>
            ))
          }
          <a href='#' className={styles.link}> Carregar mais posts</a>
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ],
    {
      fetch: ["title", "subtitle", "author", "slug"],
      pageSize: 2,
      page: 1,
    }
  )

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        author: post.data.author,
        subtitle: post.data.subtitle
      },
      first_publication_date: format(
        new Date(post.first_publication_date),
        "dd MMM yyyy",
        {
          locale: ptBR,
        }
      )
    }
  })

  return {
    props: {
      results,
    }
  }
};
