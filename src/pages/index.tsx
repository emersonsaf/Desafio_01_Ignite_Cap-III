import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss'
import styles from './home.module.scss';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


import { FiCalendar, FiUser } from 'react-icons/fi'
import Header from '../components/Header';
import Link from 'next/link';
import { useState } from 'react';
import  Head  from 'next/head';


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

export default function Home({ postsPagination }: HomeProps) {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      )
    }
  })

  const [posts, setPosts] = useState<Post[]>(formattedPost)
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleNextPage(): Promise<void> {
    if (nextPage) {
      const postsResults = await fetch(nextPage).then(response => response.json());
      setNextPage(postsResults.next_page)
      const newPosts = postsResults.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: format(
            new Date(post.first_publication_date),
            'dd MMM yyyy',
            {
              locale: ptBR,
            }
          ),
          data: {
            title: post.data.title,
            author: post.data.author,
            subtitle: post.data.subtitle
          },
        }
      })
      setPosts([...posts, ...newPosts])
    }
  }

  return (
    <>
    <Head>
      <title> SpaceTraveling | home</title>
    </Head>
      <main className={commonStyles.container}>
        <Header />
        <div className={styles.posts}>
          {
            posts?.map(post => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a className={styles.post}>
                  <strong>{post.data?.title}</strong>
                  <p>{post.data?.subtitle}</p>
                  <ul>
                    <li> <FiCalendar className={styles.logoTipo} /> {post?.first_publication_date}</li>
                    <li> <FiUser className={styles.logoTipo} /> {post.data?.author}</li>
                  </ul>
                </a>
              </Link>
            ))
          }
          {
            nextPage ? <button type='button' onClick={handleNextPage} className={styles.link}> Carregar mais posts</button> : null
          }
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
      pageSize:2,
      page: 1,
    }
  )
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        author: post.data.author,
        subtitle: post.data.subtitle
      },
    }
  })

  const postsPagination = {
    results: posts,
    next_page: postsResponse.next_page,
  }

  return {
    props: {
      postsPagination
    }
  }
};
